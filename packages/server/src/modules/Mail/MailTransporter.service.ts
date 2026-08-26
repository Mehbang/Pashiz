import { createTransport, Transporter } from 'nodemailer';
import { Mail } from './Mail';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { MAIL_TRANSPORTER_PROVIDER } from './Mail.constants';
import { InstanceSettingsService } from '@/modules/Admin/InstanceSettings.service';

/**
 * Sends the application's mail.
 *
 * The transport is built per message rather than once at boot. It used to be a
 * singleton created from the environment, which meant the administration
 * portal could save new SMTP settings and nothing would use them until someone
 * restarted the server. Building one costs nothing — nodemailer opens the
 * connection when it sends, not when it is constructed.
 *
 * The provider-supplied transport is kept as the fallback for the case where
 * nothing has ever been configured through the portal.
 */
@Injectable()
export class MailTransporter {
  constructor(
    @Inject(MAIL_TRANSPORTER_PROVIDER)
    private readonly fallbackTransporter: Transporter,

    @Inject(forwardRef(() => InstanceSettingsService))
    private readonly settings: InstanceSettingsService,
  ) {}

  async send(mail: Mail) {
    const transporter = await this.resolveTransporter();

    return transporter.sendMail(mail.mailOptions);
  }

  /**
   * A message that is not one of the application's templates — the portal's
   * own "does this configuration work" probe.
   */
  async sendRaw(options: { to: string; subject: string; text: string }) {
    const transporter = await this.resolveTransporter();
    const settings = await this.settings.getMailSettings();

    const from = settings.fromAddress
      ? settings.fromName
        ? `${settings.fromName} <${settings.fromAddress}>`
        : settings.fromAddress
      : undefined;

    return transporter.sendMail({ ...options, from });
  }

  private async resolveTransporter(): Promise<Transporter> {
    const settings = await this.settings.getMailSettings();

    if (!settings.host) return this.fallbackTransporter;

    return createTransport({
      host: settings.host,
      port: settings.port ?? undefined,
      secure: settings.secure,
      // Only send credentials when there are any: an internal relay that
      // accepts unauthenticated mail must not be forced to authenticate.
      ...(settings.username
        ? { auth: { user: settings.username, pass: settings.password ?? '' } }
        : {}),
    });
  }
}
