import { SetMetadata } from '@nestjs/common';

/** Routes a signed-out visitor may reach: the sign-in form, and signing in. */
export const ALLOW_SIGNED_OUT = 'admin:allow-signed-out';
export const AllowSignedOut = () => SetMetadata(ALLOW_SIGNED_OUT, true);

/**
 * The hidden field every mutating form carries. Its value is derived from the
 * session, so a form served to one session cannot be replayed by another, and
 * a site that cannot read the session cookie cannot produce one at all.
 *
 * Named without a leading underscore deliberately: something in the request
 * pipeline camel-cases incoming body keys, and `_csrf` arrived as `csrf`. A
 * name that is already camelCase passes through unchanged.
 */
export const CSRF_FIELD = 'csrfToken';

/**
 * Headers on every portal response.
 *
 * The policy allows no scripts of any kind, which the portal can afford
 * because it has none: every action is a form the server rendered and a POST
 * it handles. That removes the whole class of injected-script problems from a
 * page that can read every organization on the installation.
 */
export const ADMIN_RESPONSE_HEADERS: Record<string, string> = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store, max-age=0',
  'Content-Security-Policy': [
    "default-src 'none'",
    "script-src 'none'",
    "style-src 'unsafe-inline'",
    "img-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
  ].join('; '),
};
