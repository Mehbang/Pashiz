# Pashiz — Persian & Jalali localisation

Working notes for the `pashiz` branch.

## What the fork adds

A Jalali (Shamsi) calendar and full Persian localisation on top of Bigcapital.

**The rule everything follows:** storage and the API stay Gregorian. Jalali is
applied only where a date becomes text for a person, and undone the moment text
becomes a value again. 98 call sites build API payloads with
`moment(...).format('YYYY-MM-DD')` — those must never see Jalali or Persian digits.

Beyond the calendar, the fork adds two features of its own: **units of
measure** (a primary and secondary unit per item) and **category fields**
(fields a category invents for its items). Both are described below.

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

### Units of measure

- `packages/server/src/modules/ItemUnits/` — the units an organization defines
- `packages/server/src/modules/Items/utils/item-units.ts` — the one conversion
- `packages/webapp/src/containers/Preferences/Units/` — where they are defined
- `packages/webapp/src/containers/Entries/secondary-quantity.ts` — the mirror
  between the two quantity columns, with its own tests

### Category fields

- `packages/server/src/modules/ItemCategories/models/ItemCategoryField.model.ts`
  — what a category asks its items to fill in
- `packages/server/src/modules/Items/models/ItemFieldValue.model.ts` — what one
  item answered
- `packages/server/src/modules/Items/utils/category-field-filter.ts` — the
  synthetic filter key and its subquery, with its own tests
- `packages/webapp/src/containers/Dialogs/ItemCategoryDialog/ItemCategoryFieldsEditor.tsx`
  — where the fields are defined
- `packages/webapp/src/containers/Items/ItemFormCategoryFieldsSection.tsx` —
  where they are filled in
- `packages/webapp/src/containers/Drawers/ItemDetailDrawer/category-fields.ts` —
  which of an item's values belong on its detail view
- `packages/server/src/modules/Items/utils/category-field-export.ts` — the
  answers laid out where the export columns read
- `packages/server/src/modules/ItemCategories/utils/category-field-names.ts` —
  a category's field list as one spreadsheet cell, written and read back

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
$P -C packages/webapp        exec vitest run    # 143 tests
$P -C packages/server        exec jest          # 160 tests, ~1–3 minutes
$P -C packages/server        exec tsc --noEmit  # 0 errors
$P -C packages/webapp        exec tsc --noEmit  # 0 errors
```

The webapp's type-error baseline was 49 for most of this fork's life, left
untouched by choice. Upstream's September TypeScript cleanup retired them, so
the baseline is now zero and a new error is a real one. The server's full suite
is slow because the financial-statement controller specs dominate it;
`exec jest src/utils` alone is 41 tests in seconds.

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

- **New services in `docker-compose.prod.yml`.** Upstream's compose file is
  written for containers running `bigcapitalhq/*` images pulled from Docker
  Hub. This installation builds its own and calls them `pashiz/*`, so anything
  upstream adds that assumes a registry is wrong here by construction. The
  September merge brought a watchtower that polls hourly for a newer `:latest`
  of whatever carries its label — and it labelled the webapp and the server.
  Those resolve to `docker.io/pashiz/*`, which nobody has registered: the poll
  can only fail, or one day succeed against a namespace this installation does
  not own. It is disabled in `docker-compose.pashiz.yml`, service and labels
  both. Check any new service the same way: ask what it would pull.

Merged so far: `6839a25b1` (2026-09-08), 143 commits. Before that,
`2bbd98cba` (2026-08-25) — the password-length policy, the ESLint workflow,
Garage object storage, and the e2e test overhaul.

The September merge taught three things worth carrying forward.

**The dangerous conflict shape is a rename inside a translated line.** Upstream
moved API fields from snake_case to camelCase in the very lines this fork had
localized. Resolving with `--ours` leaves a column reading a key the API no
longer returns, blank and silent; `--theirs` throws away the Persian. Neither
side is the answer — it is always ours' localization on their names.

**Check for silent losses; a clean merge is not a safe one.** Two checks are
worth running every time. First, the files only this fork touched must come
back byte-identical: `comm -23` the two name lists and diff them against the
branch. Second, count every marker of fork work per file — `intl.get`,
`<T id>`, `localizedDigits`, `formatDateLocalized` — before and after; a file
that lost one had its block rewritten upstream and needs a look. That check
found the expense drawer's description row, gone with no conflict attached.

**Before accepting an upstream deletion, ask whether it was live here.** The
projects feature was removed and was safe to lose — 128 files of interface over
an API that never existed, `/api/projects` answering 404 against 401 mapped
routes. The setup wizard's subscription step was removed in the same batch and
was not safe: its API is mapped and LemonSqueezy is configured. Same kind of
change, opposite answer, and only running the server told them apart.

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

## The administration portal

`packages/server/src/modules/Admin/` — server-rendered, script-free, mounted at
`/api/admin/:portalKey` and guarded by `AdminPortalGuard`. Credentials live in
`.env` (scrypt), not the database, so restoring another installation's backup
cannot hand over this one. Every refusal is a 404, so the portal cannot be
told apart from an installation that has none.

Signup and mail settings moved out of the environment into an
`instance_settings` table read through `InstanceSettingsService`, which falls
back to the environment for anything never set. `MailTransporter` builds its
transport per message rather than once at boot, so a change takes effect
without a restart.

Two traps found while building it:

- A handler using `@Res()` still hands its return value to the global
  interceptors, and `ToJsonInterceptor` walks it recursively. Returning the
  Express response — whose graph reaches the socket and the whole application
  — exhausts the heap and kills the process. Write the response, return
  nothing.
- Something in the request pipeline camel-cases incoming body keys, so a
  hidden field named `_csrf` arrives as `csrf`. Names that are already
  camelCase survive.

## Units of measure

An organization defines its own units in Preferences → واحدهای اندازه‌گیری —
kilogram, gram, metre — and each item takes a primary unit, an optional second
one, and a factor saying how many of the second make one of the first.

**Nothing about storage changed.** A quantity is still a quantity in the item's
primary unit; the second unit is a way of reading it. Inventory, costing and
the ledger are untouched. That was a deliberate choice with Ehsan: build the
reading half first, add entry later — except the entry half turned out to be
cheap, so document lines carry both columns and either may be typed into, with
only the primary sent.

One conversion, used everywhere: `modules/Items/utils/item-units.ts`. The
editor calls it as you type; `ItemEntryTransformer`, `ItemTransformer` and
`FinancialSheet` call it when a document or report is read. Two copies would
become two answers to how many grams are in a kilogram of an item.

Both readings appear on document lines, the six detail views, the printed
copy, the shared payment link, and all four reports that count anything —
sales by items, purchases by items, inventory valuation, inventory item
details. Every Persian heading for the pair is "واحد" and "واحد فرعی".

Quantities ask the formatter for `trimTrailingZeros`, because a count has no
fixed scale: three of something is three, not three point zero zero. Money is
untouched and still follows its currency.

**Report totals deliberately carry no unit.** A total sums kilograms and metres
across items; no single unit describes it, and printing one would look right
and mean nothing.

## Category fields

A category defines fields its items fill in — a category of books asks for an
author and a translator, one of clothes for a size and a colour. Any number of
them, all free text for now.

The values live in their own table rather than as JSON on the item, because
they have to be searchable and filterable: finding a book by its author is a
join, not a scan through serialized text.

**Values are keyed by the field's id, never its name.** Renaming a field keeps
everything items had typed under it. And a value survives its item leaving the
category that defines it — it stops being shown, but putting the item back
restores what was typed, so a mis-click on the category picker costs nothing.
A blank value deletes the row rather than storing an empty string, so "never
filled in" and "cleared" look identical to everything downstream.

The filter list is the one place the resource meta is not fully known from the
model: `categoryField_<id>` keys are minted from the database and merged into
the items meta. Two things about that are easy to get wrong and are now pinned
by tests. The subquery correlates in raw SQL, which escapes the snake-case
mapper that upper-cases every other identifier — write it the way the mapper
would. And the meta endpoint snake-cases its keys on the way out, so the
interface reads `category_field_1` and posts that back; both spellings must
parse or every filter the interface can build is refused.

Both are invisible to the type checker and to unit tests. They were found by
running the thing against a real database, which is the only way this class of
fault shows up.

Not shown in invoices or reports, by design — Ehsan asked for the fields to
reach item search and filtering, nothing further.

### In and out of a spreadsheet

Both resources carry their fields through export and import.

A **category** carries its whole field list in one cell — «نویسنده، مترجم» —
because a sheet has one column per category, not one per field. The cell is
split on every separator a person might type, Latin and Persian alike, and a
name repeated in it is kept once: the category cannot hold the same field twice
and failing the row over a duplicated word would be a poor trade.

An **item** gets one column per field, named the way the filter names it —
«کارگردان — فیلم». Two categories may both define «رنگ», so the category has to
be in the header or the columns cannot be told apart. The columns are built from
the database at export time and offered by the same synthetic `categoryField_<id>`
key at import time, which is what lets an exported sheet map straight back onto
itself: 23 of the 25 columns match by name unaided, the two that do not being
stock on hand and the creation date, neither of which is importable.

Two turns in the import pipeline shape how this had to be written. The DTO is
transformed *before* validation, so a key that starts as a string and becomes a
list has to change its name on the way — hence the separate `fieldNames` cell
feeding `fields`. And the item's flat `categoryField_<id>` keys must be gone by
the time the Yup schema runs, since the item itself has no such attribute.

Exercising this shook out two things about imports generally, both now fixed.

**Validation messages were Yup's English around a translated field name** —
"نوع کالا is a required field". They are built per field now and translated
(`i18n/*/import.json`), the field name passed in rather than left to Yup's
`${path}`: Yup interpolates with `${}` and nestjs-i18n with `{}`, and the two
syntaxes overlap badly. Even the separator between listed options belongs to
the translation — Persian joins a list with «،», English with a comma.

**An enumeration was matched only on its translated label**, so a Persian sheet
had to say «خدمت» and `service` was refused. Both are read now. And a word
matching neither is passed on as written instead of being dropped to undefined:
dropping it made the row fail as a *missing required field*, an error that names
the column and hides the cause. It now says «نوع کالا» باید یکی از این‌ها باشد:
انبارگردانی‌شده، خدمت، بدون انبارگردانی — which is the whole answer.

## Untranslated strings a grep will never find

The server passes some labels through `i18n.t()` that are already English prose
rather than keys — `ACCOUNT_TYPES[].label` was `'Cash'`. The lookup misses,
nestjs-i18n returns the key, and the result reads as correct English and as
untranslated Persian. Those labels are keys now (`account.type.*`,
`account.root_type.*`, and the account normal reusing
`account.field.normal.*`), with the English in `i18n/en/account.json`.

Note that `ACCOUNT_TYPES` exists twice on the server: `constants/accounts.ts`
feeds the row values, `modules/Accounts/Accounts.constants.ts` feeds the filter
and import options. Both had to change.

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
- A relation the code reads but the query never fetched. `entries.item` was
  loaded without `entries.item.[unit, secondaryUnit]`, so every unit label came
  back empty; the reports each had the same omission. TypeScript sees nothing
  wrong — the property is declared, it is simply undefined at runtime — and the
  result is a blank column, not an error. This has come up four times in this
  fork; when adding a field that reads through a relation, check every query
  that feeds it before believing a green typecheck.
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
- Nothing stops an import writing a value for a field belonging to a category
  the item is not in — a hand-made sheet with the wrong column filled would do
  it. An exported sheet cannot: the cell is blank, and a blank writes no row.
  Worth an integrity check if hand-made sheets ever become common.
- The downloadable sample sheet for items has no category-field columns. Its
  data is static and those columns are not known until the database is read.
- The payment page used to name `Bigcapital Technology, Inc.` as the party
  charging the customer. That was simply wrong — the money goes to the
  organization, which configures its own payment details — and the consent note
  and footer now name the organization. The copyright on source files and the
  package author are untouched; those are attribution, not branding.
- `packages/webapp/src/style/pages/fonts.scss` and the Noto/Segoe `.woff` files
  beside it are dead: nothing imports that file, and its Arabic faces list
  `local('Noto Sans')` first, which has no Arabic. Left in place; safe to delete.
- Entering a quantity in the second unit works on document lines; nothing
  elsewhere accepts one. Stock adjustments and warehouse transfers still take
  the primary unit only.
- Two payment-link routes answer 401 without a session, though the controller
  calls them public metadata. A customer with no account may therefore see
  nothing at the shared link. Left alone: opening a guarded endpoint is Ehsan's
  decision, not a bug to fix in passing.
- The bundled font is Vazirmatn (SIL OFL), chosen because that licence permits
  serving the files publicly. IRANSans was tried and reverted: it is commercial
  and would need a web-embedding licence.
