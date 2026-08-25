# Pashiz — Persian & Jalali localisation

Working notes for the `pashiz` branch. Nothing here is committed yet; all of it
lives in the working tree.

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
| Jalali period arithmetic (server) | `packages/server/src/utils/jalali-date.ts` |

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

- The 53 pre-existing webapp type errors (Ehsan chose to leave them).
- `packages/server/src/i18n/*/test.json` (16 keys, a test fixture).
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
