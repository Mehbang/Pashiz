/**
 * The country's name in the organization's own language.
 *
 * `@bigcapital/utils` carries English names only, which leaves "Iran" sitting
 * in the middle of an otherwise Persian invoice. `Intl.DisplayNames` already
 * knows every region in every locale, so no translation table is needed; the
 * English name stands in if the runtime has no data for the language.
 */
export function localizedCountryName(
  isoCode?: string,
  language?: string,
  fallback = '',
): string {
  if (!isoCode) return fallback;

  try {
    const displayNames = new Intl.DisplayNames([language || 'en'], {
      type: 'region',
    });
    return displayNames.of(isoCode.toUpperCase()) || fallback;
  } catch {
    return fallback;
  }
}
