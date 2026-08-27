import { CSRF_FIELD } from './Admin.constants';

/**
 * The portal's HTML.
 *
 * Written by hand rather than through a template engine so that there is
 * exactly one way text reaches the page — `esc()` — and it is impossible to
 * interpolate without going through it. Everything shown here is typed by
 * someone else: organization names, the email addresses of people who signed
 * up, an SMTP host. None of it is trusted.
 */
const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const esc = (value: unknown): string =>
  value === null || value === undefined
    ? ''
    : String(value).replace(/[&<>"']/g, (char) => ENTITIES[char]);

/**
 * An email address, written so it survives the journey to the browser.
 *
 * Cloudflare rewrites anything that looks like an address into
 * `[email protected]` plus a small script that puts the real one back. This
 * page forbids scripts outright, so that script never runs and the reader is
 * left looking at the placeholder instead of the address. The `email_off`
 * comment pair is Cloudflare's own opt-out and is the one way to keep an
 * address intact without turning the feature off for the whole domain.
 */
export const email = (value: unknown): string =>
  value ? `<!--email_off-->${esc(value)}<!--/email_off-->` : '';

export interface PageOptions {
  title: string;
  base: string;
  csrf?: string;
  active?: string;
  notice?: { kind: 'ok' | 'bad'; text: string };
}

const STYLE = `
:root { color-scheme: light dark; --bg:#f6f7f9; --panel:#fff; --ink:#1c2127;
  --muted:#5f6b7c; --line:#dce0e5; --accent:#1f3f94; --bad:#ac2f33; --ok:#1c6e42; }
@media (prefers-color-scheme: dark) { :root { --bg:#1c2127; --panel:#252a31;
  --ink:#f6f7f9; --muted:#abb3bf; --line:#383e47; --accent:#8abbff; } }
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--ink); font:15px/1.7 Vazirmatn,system-ui,sans-serif; }
header { background:var(--panel); border-bottom:1px solid var(--line); padding:14px 22px;
  display:flex; gap:18px; align-items:center; flex-wrap:wrap; }
header strong { font-size:16px; }
nav a { color:var(--muted); text-decoration:none; padding:6px 10px; border-radius:6px; }
nav a.on { color:var(--accent); background:color-mix(in srgb, var(--accent) 12%, transparent); }
main { max-width:960px; margin:24px auto; padding:0 18px; }
section { background:var(--panel); border:1px solid var(--line); border-radius:10px;
  padding:20px; margin-bottom:20px; }
h2 { margin:0 0 4px; font-size:16px; }
p.hint { color:var(--muted); margin:0 0 16px; }
table { width:100%; border-collapse:collapse; }
th,td { text-align:right; padding:9px 10px; border-bottom:1px solid var(--line); }
th { color:var(--muted); font-weight:600; font-size:13px; }
label { display:block; margin-bottom:12px; }
label span { display:block; color:var(--muted); font-size:13px; margin-bottom:4px; }
input[type=text],input[type=password],input[type=number],input[type=email] {
  width:100%; padding:9px 11px; border:1px solid var(--line); border-radius:7px;
  background:var(--bg); color:var(--ink); font:inherit; }
button { padding:9px 16px; border:0; border-radius:7px; background:var(--accent);
  color:#fff; font:inherit; cursor:pointer; }
button.quiet { background:transparent; color:var(--accent); border:1px solid var(--line); }
.row { display:flex; gap:14px; flex-wrap:wrap; }
.row > label { flex:1; min-width:180px; }
.notice { padding:11px 14px; border-radius:8px; margin-bottom:18px; }
.notice.ok { background:color-mix(in srgb, var(--ok) 14%, transparent); color:var(--ok); }
.notice.bad { background:color-mix(in srgb, var(--bad) 14%, transparent); color:var(--bad); }
a.dl { color:var(--accent); text-decoration:none; }
.center { max-width:380px; margin:12vh auto; }
.muted { color:var(--muted); font-size:13px; }
`;

export function page(options: PageOptions, body: string): string {
  const { title, base, active, notice } = options;
  const tab = (href: string, key: string, text: string) =>
    `<a href="${esc(base)}${esc(href)}"${active === key ? ' class="on"' : ''}>${esc(text)}</a>`;

  return `<!doctype html>
<html dir="rtl" lang="fa"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)} — مدیریت پشیز</title>
<style>${STYLE}</style>
</head><body>
<header>
  <strong>مدیریت پشیز</strong>
  <nav>
    ${tab('', 'overview', 'نمای کلی')}
    ${tab('/users', 'users', 'کاربران')}
    ${tab('/organizations', 'organizations', 'سازمان‌ها')}
    ${tab('/signup', 'signup', 'ثبت‌نام')}
    ${tab('/mail', 'mail', 'ایمیل')}
    ${tab('/backups', 'backups', 'پشتیبان‌ها')}
  </nav>
  <form method="post" action="${esc(base)}/logout" style="margin-inline-start:auto">
    ${csrfField(options.csrf)}
    <button class="quiet">خروج</button>
  </form>
</header>
<main>
  ${notice ? `<div class="notice ${notice.kind === 'ok' ? 'ok' : 'bad'}">${esc(notice.text)}</div>` : ''}
  ${body}
</main>
</body></html>`;
}

export function csrfField(token?: string): string {
  return token
    ? `<input type="hidden" name="${CSRF_FIELD}" value="${esc(token)}">`
    : '';
}

export function loginPage(base: string, error?: string): string {
  return `<!doctype html>
<html dir="rtl" lang="fa"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>ورود — مدیریت پشیز</title>
<style>${STYLE}</style>
</head><body>
<main class="center">
  <section>
    <h2>مدیریت پشیز</h2>
    <p class="hint">برای ادامه وارد شوید.</p>
    ${error ? `<div class="notice bad">${esc(error)}</div>` : ''}
    <form method="post" action="${esc(base)}/login" autocomplete="off">
      <label><span>نام کاربری</span>
        <input type="text" name="username" required autocomplete="username"></label>
      <label><span>گذرواژه</span>
        <input type="password" name="password" required autocomplete="current-password"></label>
      <button>ورود</button>
    </form>
  </section>
</main>
</body></html>`;
}
