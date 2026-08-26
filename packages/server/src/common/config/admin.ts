import { registerAs } from '@nestjs/config';

/**
 * The administration portal.
 *
 * All four values are written by `setup.sh` at install time and never have a
 * default: an installation that was not asked for them has no portal at all,
 * and every route under it refuses before it looks at anything else. That is
 * deliberate — a default administrator password on a public server is worse
 * than no administration page.
 *
 * `path` is the unguessable segment the portal answers on. It is not a
 * security control on its own — the password behind it is — but it keeps the
 * login form off the reach of anyone scanning for one.
 *
 * `passwordHash` is scrypt, in the form `scrypt$N$r$p$salt$hash`, produced by
 * the installer. The plaintext is never written anywhere.
 */
export default registerAs('admin', () => ({
  path: process.env.PASHIZ_ADMIN_PATH || null,
  username: process.env.PASHIZ_ADMIN_USERNAME || null,
  passwordHash: process.env.PASHIZ_ADMIN_PASSWORD_HASH || null,
  secret: process.env.PASHIZ_ADMIN_SECRET || null,

  /** How long a signed-in session lasts before it has to be renewed. */
  sessionTtlMinutes: parseInt(
    process.env.PASHIZ_ADMIN_SESSION_TTL_MINUTES ?? '120',
    10,
  ),
}));
