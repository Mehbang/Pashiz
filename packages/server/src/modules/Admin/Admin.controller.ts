import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { createReadStream } from 'node:fs';
import type { Request, Response } from 'express';
import { ADMIN_SESSION_COOKIE, AdminAuthService } from './AdminAuth.service';
import { AdminPortalGuard, readCookie } from './AdminPortal.guard';
import { AdminDataService } from './AdminData.service';
import { AdminBackupService } from './AdminBackup.service';
import { InstanceSettingsService } from './InstanceSettings.service';
import { MailTransporter } from '@/modules/Mail/MailTransporter.service';
import { AllowSignedOut, ADMIN_RESPONSE_HEADERS } from './Admin.constants';
import {
  backupsView,
  mailView,
  organizationsView,
  overviewView,
  signupView,
  usersView,
} from './AdminPages';
import { loginPage } from './AdminView';
import { PublicRoute } from '@/modules/Auth/guards/jwt.guard';

/**
 * The administration portal.
 *
 * Excluded from the API documentation on purpose — the generated schema is
 * served publicly at /swagger and would otherwise advertise both that a portal
 * exists and every route it answers.
 */
@Controller('admin/:portalKey')
@ApiExcludeController()
// Opts out of the application's own JWT guard: the portal is not part of the
// tenant application and authenticates its own way. `AdminPortalGuard` below
// is what actually admits anyone, and it runs on every route here.
@PublicRoute()
@UseGuards(AdminPortalGuard)
export class AdminController {
  constructor(
    private readonly adminAuth: AdminAuthService,
    private readonly data: AdminDataService,
    private readonly backups: AdminBackupService,
    private readonly settings: InstanceSettingsService,
    private readonly mailTransporter: MailTransporter,
  ) {}

  // ------------------------------------------------------------- signing in -

  @Get()
  @AllowSignedOut()
  async index(@Req() request: Request, @Res() response: Response) {
    const base = this.base(request);

    if (!this.signedIn(request)) {
      return this.html(response, loginPage(base));
    }
    const [users, organizations, signup, backupFiles] = await Promise.all([
      this.data.getUsers(),
      this.data.getOrganizations(),
      this.settings.getSignupSettings(),
      this.backups.list(),
    ]);
    return this.html(
      response,
      overviewView({
        base,
        csrf: this.csrf(request),
        users,
        organizations,
        signup,
        backupCount: backupFiles.length,
        notice: this.notice(request),
      }),
    );
  }

  @Post('login')
  @AllowSignedOut()
  async login(
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: { username?: string; password?: string },
  ) {
    const base = this.base(request);
    const ip = this.ip(request);

    if (this.adminAuth.isLockedOut(ip)) {
      this.adminAuth.audit(ip, 'Sign-in refused while locked out');
      return this.html(
        response,
        loginPage(base, 'به‌دلیل تلاش‌های ناموفق، ورود موقتاً بسته است.'),
        429,
      );
    }
    const ok = await this.adminAuth.verifyCredentials(
      body?.username ?? '',
      body?.password ?? '',
    );
    if (!ok) {
      this.adminAuth.recordFailure(ip);
      this.adminAuth.audit(ip, 'Failed sign-in');
      // One message for both a wrong name and a wrong password.
      return this.html(
        response,
        loginPage(base, 'نام کاربری یا گذرواژه نادرست است.'),
        401,
      );
    }
    this.adminAuth.recordSuccess(ip);
    this.adminAuth.audit(ip, 'Signed in');

    const session = this.adminAuth.issueSession();
    response.cookie(ADMIN_SESSION_COOKIE, session.value, {
      httpOnly: true,
      sameSite: 'strict',
      secure: this.isHttps(request),
      expires: session.expiresAt,
      path: `/api/admin/${request.params.portalKey}`,
    });
    return this.redirect(response, base);
  }

  @Post('logout')
  logout(@Req() request: Request, @Res() response: Response) {
    response.clearCookie(ADMIN_SESSION_COOKIE, {
      path: `/api/admin/${request.params.portalKey}`,
    });
    this.adminAuth.audit(this.ip(request), 'Signed out');

    return this.redirect(response, this.base(request));
  }

  // ------------------------------------------------------------------ pages -

  @Get('users')
  async users(@Req() request: Request, @Res() response: Response) {
    return this.html(
      response,
      usersView({
        base: this.base(request),
        csrf: this.csrf(request),
        users: await this.data.getUsers(),
        notice: this.notice(request),
      }),
    );
  }

  @Get('organizations')
  async organizations(@Req() request: Request, @Res() response: Response) {
    return this.html(
      response,
      organizationsView({
        base: this.base(request),
        csrf: this.csrf(request),
        organizations: await this.data.getOrganizations(),
        notice: this.notice(request),
      }),
    );
  }

  @Get('signup')
  async signupPage(@Req() request: Request, @Res() response: Response) {
    return this.html(
      response,
      signupView({
        base: this.base(request),
        csrf: this.csrf(request),
        settings: await this.settings.getSignupSettings(),
        notice: this.notice(request),
      }),
    );
  }

  @Post('signup')
  async saveSignup(
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: Record<string, string>,
  ) {
    if (!this.checkCsrf(request, body)) return this.deny(response);

    await this.settings.setSignupSettings({
      disabled: body.disabled === 'on',
      emailConfirmation: body.emailConfirmation === 'on',
      allowedDomains: this.toList(body.allowedDomains),
      allowedEmails: this.toList(body.allowedEmails),
    });
    this.adminAuth.audit(this.ip(request), 'Updated signup settings');

    return this.redirect(response, `${this.base(request)}/signup?ok=saved`);
  }

  @Get('mail')
  async mailPage(@Req() request: Request, @Res() response: Response) {
    return this.html(
      response,
      mailView({
        base: this.base(request),
        csrf: this.csrf(request),
        settings: await this.settings.getMailSettings(),
        notice: this.notice(request),
      }),
    );
  }

  @Post('mail')
  async saveMail(
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: Record<string, string>,
  ) {
    if (!this.checkCsrf(request, body)) return this.deny(response);

    const current = await this.settings.getMailSettings();

    await this.settings.setMailSettings({
      host: body.host?.trim() || null,
      port: body.port ? parseInt(body.port, 10) : null,
      secure: body.secure === 'on',
      username: body.username?.trim() || null,
      // An empty password field means "leave it alone". The stored one is
      // never rendered back into the form, so a blank box is the normal state
      // and must not wipe a working configuration.
      password: body.password ? body.password : current.password,
      fromName: body.fromName?.trim() || null,
      fromAddress: body.fromAddress?.trim() || null,
    });
    this.adminAuth.audit(this.ip(request), 'Updated mail settings');

    return this.redirect(response, `${this.base(request)}/mail?ok=saved`);
  }

  @Post('mail/test')
  async testMail(
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: Record<string, string>,
  ) {
    if (!this.checkCsrf(request, body)) return this.deny(response);

    const to = body.to?.trim();
    if (!to)
      return this.redirect(
        response,
        `${this.base(request)}/mail?bad=noaddress`,
      );

    try {
      await this.mailTransporter.sendRaw({
        to,
        subject: 'آزمون پیکربندی ایمیل پشیز',
        text: 'اگر این پیام رسید، تنظیمات ایمیل درست است.',
      });
      this.adminAuth.audit(this.ip(request), 'Sent a test email');

      return this.redirect(response, `${this.base(request)}/mail?ok=sent`);
    } catch (error: any) {
      this.adminAuth.audit(this.ip(request), 'Test email failed');

      return this.redirect(
        response,
        `${this.base(request)}/mail?bad=${encodeURIComponent(error?.message ?? 'failed')}`,
      );
    }
  }

  // ---------------------------------------------------------------- backups -

  @Get('backups')
  async backupsPage(@Req() request: Request, @Res() response: Response) {
    return this.html(
      response,
      backupsView({
        base: this.base(request),
        csrf: this.csrf(request),
        files: await this.backups.list(),
        state: this.backups.getState(),
        notice: this.notice(request),
      }),
    );
  }

  @Post('backups')
  async startBackup(
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: Record<string, string>,
  ) {
    if (!this.checkCsrf(request, body)) return this.deny(response);

    const { started } = this.backups.start();
    this.adminAuth.audit(this.ip(request), 'Started a full backup');

    return this.redirect(
      response,
      `${this.base(request)}/backups?${started ? 'ok=started' : 'bad=running'}`,
    );
  }

  @Post('backups/delete')
  async deleteBackup(
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: Record<string, string>,
  ) {
    if (!this.checkCsrf(request, body)) return this.deny(response);

    const removed = await this.backups.remove(body.name ?? '');
    this.adminAuth.audit(this.ip(request), 'Deleted a backup archive');

    return this.redirect(
      response,
      `${this.base(request)}/backups?${removed ? 'ok=deleted' : 'bad=missing'}`,
    );
  }

  @Get('backups/download')
  downloadBackup(
    @Req() request: Request,
    @Res() response: Response,
    @Query('name') name: string,
  ) {
    const path = this.backups.resolveForDownload(name ?? '');
    if (!path) return this.deny(response);

    this.adminAuth.audit(this.ip(request), 'Downloaded a backup archive');

    response.set({
      ...ADMIN_RESPONSE_HEADERS,
      'Content-Type': 'application/gzip',
      'Content-Disposition': `attachment; filename="${name.replace(/[^\w.-]/g, '')}"`,
    });
    createReadStream(path).pipe(response);
  }

  @Get('organizations/:tenantId/backup')
  async organizationBackup(
    @Req() request: Request,
    @Res() response: Response,
    @Param('tenantId') tenantId: string,
  ) {
    const { filename, content } = await this.data.exportOrganization(
      parseInt(tenantId, 10),
    );
    this.adminAuth.audit(this.ip(request), `Exported organization ${tenantId}`);

    return this.sendFile(response, filename, content);
  }

  @Get('users/:userId/backup')
  async userBackup(
    @Req() request: Request,
    @Res() response: Response,
    @Param('userId') userId: string,
  ) {
    const { filename, content } = await this.data.exportUser(
      parseInt(userId, 10),
    );
    this.adminAuth.audit(this.ip(request), `Exported user ${userId}`);

    return this.sendFile(response, filename, content);
  }

  // ----------------------------------------------------------------- helpers -

  private base(request: Request): string {
    return `/api/admin/${encodeURIComponent(request.params.portalKey)}`;
  }

  private signedIn(request: Request): boolean {
    return this.adminAuth.verifySession(
      readCookie(request, ADMIN_SESSION_COOKIE),
    );
  }

  private csrf(request: Request): string {
    const session = readCookie(request, ADMIN_SESSION_COOKIE);

    return session ? this.adminAuth.csrfToken(session) : '';
  }

  private checkCsrf(request: Request, body: Record<string, string>): boolean {
    return this.adminAuth.verifyCsrf(
      readCookie(request, ADMIN_SESSION_COOKIE),
      body?.csrfToken ?? '',
    );
  }

  /**
   * These four write the response and return nothing, deliberately.
   *
   * A handler using `@Res()` is in manual mode, but its return value still
   * reaches the global interceptors, and `ToJsonInterceptor` walks whatever it
   * is given recursively. Handing it an Express response — whose graph reaches
   * the socket, the server and the whole application — exhausts the heap and
   * takes the process down.
   */
  private deny(response: Response): void {
    response.status(404).send();
  }

  private isHttps(request: Request): boolean {
    return (
      request.protocol === 'https' ||
      request.headers['x-forwarded-proto'] === 'https'
    );
  }

  private ip(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;

    return (first?.split(',')[0] ?? request.ip ?? 'unknown').trim();
  }

  private notice(request: Request) {
    const ok = request.query?.ok as string | undefined;
    const bad = request.query?.bad as string | undefined;

    if (ok) return { kind: 'ok' as const, text: NOTICES[ok] ?? 'انجام شد.' };
    if (bad) return { kind: 'bad' as const, text: NOTICES[bad] ?? bad };

    return undefined;
  }

  private html(response: Response, body: string, status = 200): void {
    response.status(status).set({
      ...ADMIN_RESPONSE_HEADERS,
      'Content-Type': 'text/html; charset=utf-8',
    });
    response.send(body);
  }

  private redirect(response: Response, to: string): void {
    response.set(ADMIN_RESPONSE_HEADERS);
    response.redirect(303, to);
  }

  private sendFile(
    response: Response,
    filename: string,
    content: Buffer,
  ): void {
    const ascii = filename.replace(/[^\x20-\x7E]/g, '') || 'pashiz-backup';

    response.set({
      ...ADMIN_RESPONSE_HEADERS,
      'Content-Type': 'application/gzip',
      'Content-Length': String(content.length),
      'Content-Disposition':
        `attachment; filename="${ascii}"; ` +
        `filename*=UTF-8''${encodeURIComponent(filename)}`,
    });
    response.send(content);
  }

  private toList(value: string | undefined): string[] {
    return (value ?? '')
      .split(/[\s,]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
}

const NOTICES: Record<string, string> = {
  saved: 'ذخیره شد.',
  sent: 'پیام آزمایشی فرستاده شد.',
  started: 'پشتیبان‌گیری آغاز شد؛ چند دقیقه طول می‌کشد.',
  deleted: 'بایگانی پاک شد.',
  running: 'یک پشتیبان‌گیری همین حالا در جریان است.',
  missing: 'این بایگانی پیدا نشد.',
  noaddress: 'نشانی گیرنده را وارد کنید.',
};
