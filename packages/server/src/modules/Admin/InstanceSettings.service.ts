import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InstanceSetting } from '@/modules/System/models/InstanceSetting.model';

/**
 * Settings the installation's administrator can change while it runs.
 *
 * Each one has a home in the environment already; this reads the database
 * first and falls back to that. So an installation nobody has touched behaves
 * exactly as it did before this existed, and the admin page overrides without
 * anyone editing `.env` or restarting anything.
 *
 * Values are cached for a few seconds. Signup restrictions are consulted on
 * every registration attempt and the mail settings on every message, and
 * neither is worth a query each time; a change from the admin page clears the
 * cache immediately, so the delay is only ever visible to a second server
 * process, and only briefly.
 */
export interface SignupSettings {
  disabled: boolean;
  allowedDomains: string[];
  allowedEmails: string[];
  emailConfirmation: boolean;
}

export interface MailSettings {
  host: string | null;
  port: number | null;
  secure: boolean;
  username: string | null;
  password: string | null;
  fromName: string | null;
  fromAddress: string | null;
}

const CACHE_TTL_MS = 5_000;

export const SIGNUP_SETTINGS_KEY = 'signup';
export const MAIL_SETTINGS_KEY = 'mail';

@Injectable()
export class InstanceSettingsService {
  private cache = new Map<string, { value: unknown; expiresAt: number }>();

  constructor(
    private readonly configService: ConfigService,

    @Inject(InstanceSetting.name)
    private readonly instanceSettingModel: typeof InstanceSetting,
  ) {}

  /**
   * Whether registration is open, and to whom.
   */
  public async getSignupSettings(): Promise<SignupSettings> {
    const stored =
      await this.read<Partial<SignupSettings>>(SIGNUP_SETTINGS_KEY);
    const fallback = this.configService.get('signupRestrictions') ?? {};

    return {
      disabled: stored?.disabled ?? Boolean(fallback.disabled),
      allowedDomains: stored?.allowedDomains ?? fallback.allowedDomains ?? [],
      allowedEmails: stored?.allowedEmails ?? fallback.allowedEmails ?? [],
      emailConfirmation:
        stored?.emailConfirmation ??
        Boolean(this.configService.get('signup.emailConfirmation')),
    };
  }

  public async setSignupSettings(settings: SignupSettings): Promise<void> {
    await this.write(SIGNUP_SETTINGS_KEY, settings);
  }

  /**
   * Where outgoing mail goes.
   */
  public async getMailSettings(): Promise<MailSettings> {
    const stored = await this.read<Partial<MailSettings>>(MAIL_SETTINGS_KEY);

    return {
      host: stored?.host ?? this.configService.get('mail.host') ?? null,
      port: stored?.port ?? this.configService.get('mail.port') ?? null,
      secure: stored?.secure ?? Boolean(this.configService.get('mail.secure')),
      username:
        stored?.username ?? this.configService.get('mail.username') ?? null,
      password:
        stored?.password ?? this.configService.get('mail.password') ?? null,
      fromName:
        stored?.fromName ?? this.configService.get('mail.from.name') ?? null,
      fromAddress:
        stored?.fromAddress ??
        this.configService.get('mail.from.address') ??
        null,
    };
  }

  public async setMailSettings(settings: MailSettings): Promise<void> {
    await this.write(MAIL_SETTINGS_KEY, settings);
  }

  private async read<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T | null;
    }
    const row = await this.instanceSettingModel.query().findOne({ key });

    let value: T | null = null;
    try {
      value = row?.value ? (JSON.parse(row.value) as T) : null;
    } catch {
      // A hand-edited row should not take the installation down.
      value = null;
    }
    this.cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });

    return value;
  }

  private async write(key: string, value: unknown): Promise<void> {
    const serialized = JSON.stringify(value);
    const existing = await this.instanceSettingModel.query().findOne({ key });

    if (existing) {
      await this.instanceSettingModel
        .query()
        .findById(existing.id)
        .patch({ value: serialized });
    } else {
      await this.instanceSettingModel
        .query()
        .insert({ key, value: serialized });
    }
    this.cache.delete(key);
  }
}
