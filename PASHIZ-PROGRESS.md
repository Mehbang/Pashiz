# Pashiz — Persian & Jalali localisation

Working notes for the `pashiz` branch.

## What the fork adds

A Jalali (Shamsi) calendar and full Persian localisation on top of Bigcapital.

**The rule everything follows:** storage and the API stay Gregorian. Jalali is
applied only where a date becomes text for a person, and undone the moment text
becomes a value again. 98 call sites build API payloads with
`moment(...).format('YYYY-MM-DD')` — those must never see Jalali or Persian digits.

## Where things live

| Concern | Location |
|---|---|
| Calendar arithmetic, formatting, digits | `shared/bigcapital-utils/src/jalali/` |
| Currency table (incl. IRR fix, IRT) | `shared/bigcapital-utils/src/currencies/` |
| Calendar-aware formatter (client) | `packages/webapp/src/utils/date-formatter.ts` |
| Locale conventions outside React | `packages/webapp/src/utils/locale.ts` |
| Jalali date picker + Formik binding | `packages/webapp/src/components/Forms/JalaaliDateInput/` |
| Calendar dispatcher for date fields | `packages/webapp/src/components/Forms/FDateInput.tsx` |
| RTL corrections for Blueprint | `packages/webapp/src/style/_rtl.scss` |
| Bundled font (Vazirmatn) | `packages/webapp/src/style/_fonts.scss` + `style/fonts/` |
| Client translations | `packages/webapp/src/lang/{en,fa}/index.json` |
| Server translations | `packages/server/src/i18n/{en,fa}/` |
| Jalali period arithmetic (shared) | `shared/bigcapital-utils/src/jalali/period.ts` |
| Calendar/digit helpers (server) | `packages/server/src/utils/jalali-date.ts` |
| Per-organization export/import | `packages/server/src/modules/OrganizationBackup/` |
| Its settings tab | `packages/webapp/src/containers/Preferences/Backup/` |
| Deployment | `setup.sh`, `update.sh`, `docker-compose.pashiz.yml`, `docker-compose.https.yml`, `DEPLOY.md` |

## How a calendar is chosen

- **Client** — the active locale. `AppIntlLoader` resolves it from `?lang=`, the
  `locale` cookie (filled from the organisation's language after login), or
  local storage. Nothing else selects it: the browser language is deliberately
  ignored, otherwise an English browser would open this Iranian build in English.
  Default is Persian; change `DEFAULT_LOCALE` in `constants/languagesOptions.tsx`.
- **Server** — the organisation's `language` setting, via `calendarOfLanguage()`.
  Threaded through report meta into every sheet and table class.

## Verification

```bash
export PATH="$HOME/.claude-tools/node18/bin:$PATH"
P="$HOME/.claude-tools/bin/pnpm"
$P -C shared/bigcapital-utils exec vitest run   # 53 tests
$P -C packages/webapp        exec vitest run    # 87 tests
$P -C packages/server        exec jest src/utils # 30 tests
$P -C packages/server        exec tsc --noEmit  # 0 errors
$P -C packages/webapp        exec tsc --noEmit  # 53 — pre-existing baseline
```

The webapp's 53 type errors were present before this work and are untouched by
choice; they sit mostly in the financial reports' `dynamicColumns.tsx`.

## Keeping up with upstream

`bigcapitalhq:develop` is merged into `pashiz` from time to time. After each
merge, re-run the checks above and audit two things that a clean textual merge
will not catch:

- **i18n key drift.** Upstream renames keys in `src/i18n/en/*.json`; the `fa`
  namespace then silently falls back to English. Compare the key sets:

  ```bash
  node -e '
  const fs=require("fs"),p=require("path"),b="packages/server/src/i18n";
  const flat=(o,pre="")=>Object.entries(o).flatMap(([k,v])=>typeof v==="object"&&v?flat(v,pre+k+"."):[pre+k]);
  for(const f of fs.readdirSync(p.join(b,"en"))){
    const E=new Set(flat(JSON.parse(fs.readFileSync(p.join(b,"en",f)))));
    const F=new Set(flat(JSON.parse(fs.readFileSync(p.join(b,"fa",f)))));
    const d=[...E].filter(k=>!F.has(k)).concat([...F].filter(k=>!E.has(k)));
    if(d.length)console.log(f,d);
  }'
  ```

  The same check applies to `packages/webapp/src/lang/{en,fa}/index.json`.

- **New date rendering.** Anything upstream adds that formats a date must go
  through `useDateInputFormatter` / `formatDateLocalized` on the client or
  `formatDateIn` on the server, or it will render Gregorian inside a Persian
  organisation.

Merged so far: `2bbd98cba` (2026-08-25), which brought the password-length
policy, the ESLint workflow, Garage object storage, and the e2e test overhaul.

## Deployment

Runs at **https://pashiz.shishek.ir** (`91.107.171.86`, Ubuntu 26.04),
installed at `/opt/pashiz`. `DEPLOY.md` covers install, update, backup, HTTPS
and troubleshooting.

Two different backups exist, for two different jobs:

- `./update.sh backup` / `restore` — the whole installation, users included.
  For moving a server.
- **Preferences → پشتیبان‌گیری** — one organization's books, as a `.pashiz`
  file. For carrying a set of books to a Bigcapital you already have an
  account on. Leaves the target's users and other organizations alone.

## Light and dark

Both themes were already written — the light palette on `:root` in
`style/_variables.scss`, the dark one beside it, with every component's own
dark rules hanging off `.bp4-dark`. Only the light one was unreachable:
`index.html` pinned `class="bp4-dark"` on `<body>`, and the script meant to
decide was loaded from `/public/preload-theme.js`, a path the single-page
fallback answers with index.html, so in production it never ran.

The script is inlined in `<head>` now and writes the class to `<html>` before
the first paint; `src/utils/theme.ts` holds the choice and `ThemeSwitch` in the
topbar flips it. `shift+H` goes through the same code, so it persists too. The
palette block is keyed on `html.bp4-dark, body.bp4-dark` rather than the bare
class — `:root` carries the light palette at equal specificity, and the bare
class would leave the winner to the order of the file.

## Traps that only a real Linux server or a live run exposed

Each of these passed every local check and still broke:

- The repo holds **two** module directories, `EE/` (AuditLogs) and `ee/`
  (Workspaces). macOS merges them, so a Docker image built from a macOS
  checkout is missing one. Build on Linux.
- The migration container needs `working_dir: /app/packages/server`; the
  system migration path is relative to the working directory.
- `timeouts` is not a site-level Caddyfile directive — Caddy refused the whole
  config and restart-looped.
- The Garage image has **no shell at all**, and its v1.3.1 CLI takes the key
  name and bucket positionally. Upstream's mounted bootstrap script cannot run
  and never could.
- Identifiers passed to the tenant knex must be camelCase; objection's mappers
  turn `ACCOUNTS_TRANSACTIONS` into `ACCOUNTS__TRANSACTIONS`.
- `DATETIME` values JSON-serialise to ISO-8601 with a `Z`, which MySQL then
  refuses on insert.
- An organization name is Persian and an HTTP header is latin-1, so any
  `Content-Disposition` filename needs RFC 5987.
- zsh does not word-split unquoted expansions. A command that works inside
  `update.sh` (bash) can fail pasted into a mac terminal.
- A tenant database keeps its **own** `users` table, mirroring the system
  users by `systemUserId`. That row is written once, when the organization is
  built, and never again — so an organization export that carried it replaced
  the local owner with a stranger and locked everyone out permanently: the
  authorization guard could not resolve an ability, every authorized endpoint
  failed, and the application rendered a blank page. Importing an organization
  into the *same* one it came from hides this completely, which is exactly how
  it got shipped.
- `docker compose build server webapp` hands both services to buildx bake,
  which builds them **concurrently**. Two pnpm installs and two bundlers at
  once exhaust a 3.8GB server; the kernel kills buildx and Docker reports only
  `failed to execute bake: signal: killed`. Each image is now built by its own
  invocation, and `ensure_swap` refuses to start a build on a machine with
  under 8GB of RAM+swap and nothing to fall back on.

## Pre-existing Bigcapital bugs fixed along the way

1. `import('moment/locale/${x}')` could not be resolved by Vite — this broke
   Arabic entirely, not just Persian.
2. moment's `fa` locale rewrites digits, which would have corrupted every API
   payload. Its `postformat` hook is now dropped.
3. The webapp `test` script pointed at a missing file; 73 tests had never run.
4. `getDateRanges` memoised on its first argument only, colliding across ranges.
5. The October fiscal-year option read "October - November".
6. Report **table** classes never received the report meta, so their period
   columns ignored the calendar.
7. The API-keys dialog had no `Dialog` wrapper — its form rendered inline on
   every page, adding a second document scrollbar and stray controls.
8. `i18n.t()` in the account seeder was called without a namespace, so it was a
   no-op.
9. Breadcrumbs were built with `withBreadcrumbs([])`, so the translated
   `breadcrumb` already present on every route was never used.

## Not done

- The 49 pre-existing webapp type errors (Ehsan chose to leave them; four of
  the original 53 were retired incidentally by the select wrappers).
- Attachments in the per-organization export are written and read but have
  never been exercised: the development machine has no object store running,
  and the server had no attachment to carry. Worth testing once there is one.
- The server is not always on the latest commit — `sudo ./update.sh` on it.
- The ESLint check upstream added (`pnpm run lint:check`) reports ~900 problems
  across ~550 server files. They are upstream's, not this fork's; the workflow
  only gates `main`/`develop`, so `pashiz` is unaffected.
- Organisations built before a seeder fix keep their old seeded data; only newly
  created ones pick it up.
- `Bigcapital Technology, Inc.` is left as-is in the payment authorisation — it
  names the legal entity charging the customer, not the UI brand.
- `packages/webapp/src/style/pages/fonts.scss` and the Noto/Segoe `.woff` files
  beside it are dead: nothing imports that file, and its Arabic faces list
  `local('Noto Sans')` first, which has no Arabic. Left in place; safe to delete.
- The bundled font is Vazirmatn (SIL OFL), chosen because that licence permits
  serving the files publicly. IRANSans was tried and reverted: it is commercial
  and would need a web-embedding licence.
