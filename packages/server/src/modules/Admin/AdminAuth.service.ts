import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

// `promisify` picks the overload without options, which is the only one that
// cannot express the cost parameters the stored hash carries.
const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

export const ADMIN_SESSION_COOKIE = 'pashiz_admin_session';

/**
 * How many failures from one address before it is turned away, and for how
 * long. Deliberately small: there is exactly one account here, so a human who
 * has forgotten the password will not exhaust it, and a script will.
 */
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

interface AttemptRecord {
  failures: number;
  firstFailureAt: number;
  lockedUntil: number;
}

/**
 * Everything that decides whether a request may act as the administrator.
 *
 * The portal has one account and it is not in the database — a restore from
 * another installation must not be able to hand someone the keys to this one,
 * and an operator locked out by a bad restore still needs a way in. It lives
 * in the environment, hashed.
 */
@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger('AdminPortal');
  private readonly attempts = new Map<string, AttemptRecord>();

  constructor(private readonly configService: ConfigService) {}

  /**
   * Whether the portal was configured at all. Nothing under it responds
   * otherwise — not even to say that it is switched off.
   */
  public isConfigured(): boolean {
    return Boolean(
      this.configService.get('admin.path') &&
        this.configService.get('admin.username') &&
        this.configService.get('admin.passwordHash') &&
        this.configService.get('admin.secret'),
    );
  }

  /**
   * Compares the portal segment from the URL against the configured one.
   *
   * Constant-time, and length-padded before comparing, so neither the value
   * nor its length can be recovered by measuring how long the answer took.
   */
  public isPortalPath(candidate: string): boolean {
    const expected = this.configService.get<string>('admin.path');

    if (!expected || !candidate) return false;

    return this.constantTimeEquals(candidate, expected);
  }

  /**
   * Verifies a username and password.
   *
   * Both are checked even when the username is already wrong, so a wrong
   * username and a wrong password cost the same time and neither can be
   * enumerated.
   */
  public async verifyCredentials(
    username: string,
    password: string,
  ): Promise<boolean> {
    const expectedUsername = this.configService.get<string>('admin.username');
    const passwordHash = this.configService.get<string>('admin.passwordHash');

    if (!expectedUsername || !passwordHash) return false;

    const usernameMatches = this.constantTimeEquals(
      username ?? '',
      expectedUsername,
    );
    const passwordMatches = await this.verifyPassword(
      password ?? '',
      passwordHash,
    );
    return usernameMatches && passwordMatches;
  }

  /**
   * `scrypt$N$r$p$salt$hash`, all base64url. Chosen over bcrypt because the
   * installer has to produce one of these with nothing but the node binary
   * already inside the image.
   */
  public async verifyPassword(
    password: string,
    stored: string,
  ): Promise<boolean> {
    const parts = stored.split('$');

    if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

    const [, nRaw, rRaw, pRaw, saltRaw, hashRaw] = parts;
    const N = parseInt(nRaw, 10);
    const r = parseInt(rRaw, 10);
    const p = parseInt(pRaw, 10);

    if (!N || !r || !p) return false;

    let expected: Buffer;
    try {
      expected = Buffer.from(hashRaw, 'base64');
    } catch {
      return false;
    }
    const salt = Buffer.from(saltRaw, 'base64');

    try {
      // scrypt needs roughly 128 * N * r bytes; the default cap rejects the
      // parameters the installer uses.
      const actual = await scryptAsync(password, salt, expected.length, {
        N,
        r,
        p,
        maxmem: 256 * N * r,
      });

      return timingSafeEqual(actual, expected);
    } catch {
      return false;
    }
  }

  // ------------------------------------------------------------ sessions ---

  /**
   * A session is its own signature: issued-at, expiry and a random id, with an
   * HMAC over all three. Nothing is stored server-side, so nothing has to be
   * cleaned up, and the secret is the portal's own — not the application's
   * JWT key, so a leak of one is not a leak of the other.
   */
  public issueSession(): { value: string; expiresAt: Date } {
    const ttlMinutes = this.configService.get<number>(
      'admin.sessionTtlMinutes',
    );
    const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
    const payload = [randomBytes(18).toString('base64url'), expiresAt].join(
      '.',
    );

    return {
      value: `${payload}.${this.sign(payload)}`,
      expiresAt: new Date(expiresAt),
    };
  }

  public verifySession(cookie: string | undefined): boolean {
    if (!cookie) return false;

    const index = cookie.lastIndexOf('.');
    if (index < 0) return false;

    const payload = cookie.slice(0, index);
    const signature = cookie.slice(index + 1);

    if (!this.constantTimeEquals(signature, this.sign(payload))) return false;

    const expiresAt = parseInt(payload.split('.')[1] ?? '', 10);

    return Boolean(expiresAt) && expiresAt > Date.now();
  }

  private sign(payload: string): string {
    const secret = this.configService.get<string>('admin.secret') ?? '';

    return createHmac('sha256', secret).update(payload).digest('base64url');
  }

  /**
   * A token bound to the session that issued it. The portal renders it into
   * every form and refuses any POST that comes back without it, so a page on
   * another site cannot drive an open session — it can make the browser send
   * the cookie, but it cannot read it, and without it cannot produce this.
   */
  public csrfToken(session: string): string {
    return this.sign(`csrf:${session}`);
  }

  public verifyCsrf(session: string | undefined, token: string): boolean {
    if (!session || !token) return false;

    return this.constantTimeEquals(token, this.csrfToken(session));
  }

  // ------------------------------------------------------- brute force  ---

  public isLockedOut(ip: string): boolean {
    const record = this.attempts.get(ip);

    return Boolean(record && record.lockedUntil > Date.now());
  }

  public recordFailure(ip: string): void {
    const now = Date.now();
    const record = this.attempts.get(ip);

    if (!record || now - record.firstFailureAt > ATTEMPT_WINDOW_MS) {
      this.attempts.set(ip, {
        failures: 1,
        firstFailureAt: now,
        lockedUntil: 0,
      });
      return;
    }
    record.failures += 1;

    if (record.failures >= MAX_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_MS;
      record.failures = 0;
      record.firstFailureAt = now;
      this.logger.warn(`Locked out ${ip} after repeated failed sign-ins.`);
    }
  }

  public recordSuccess(ip: string): void {
    this.attempts.delete(ip);
  }

  /**
   * Records an action for the operator to read back later. Deliberately never
   * includes what was submitted — a mail password would end up in the log.
   */
  public audit(ip: string, action: string): void {
    this.logger.log(`${action} (from ${ip})`);
  }

  private constantTimeEquals(a: string, b: string): boolean {
    // Hashing first makes both sides the same length, so the comparison leaks
    // nothing about how long the real value is.
    const secret = this.configService.get<string>('admin.secret') ?? '';
    const digest = (value: string) =>
      createHmac('sha256', secret).update(value).digest();

    return timingSafeEqual(digest(a), digest(b));
  }
}
