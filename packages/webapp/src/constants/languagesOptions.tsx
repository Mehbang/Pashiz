import intl from 'react-intl-universal';
import type { CalendarSystem } from '@/utils/date-formatter';

export interface SupportedLocale {
  value: string;
  /** The language's name in its own script, for use before locales load. */
  nativeName: string;
  /** Translation key holding the language's name in the active locale. */
  messageKey: string;
  /** Calendar this language reads dates in. */
  calendar: CalendarSystem;
  /** Whether numbers are rendered with Persian digit glyphs. */
  persianDigits: boolean;
}

/**
 * Locales the application ships translations for. This is the single source of
 * truth: `AppIntlLoader` filters the detected locale against it, the language
 * pickers list it, and the date and money formatters read their conventions
 * from it.
 */
export const SUPPORTED_LOCALES: SupportedLocale[] = [
  {
    value: 'en',
    nativeName: intl.get('english'),
    messageKey: 'english',
    calendar: 'gregorian',
    persianDigits: false,
  },
  {
    value: 'ar',
    nativeName: 'العربية',
    messageKey: 'arabic',
    calendar: 'gregorian',
    persianDigits: false,
  },
  {
    value: 'fa',
    nativeName: 'فارسی',
    messageKey: 'persian',
    calendar: 'jalali',
    persianDigits: true,
  },
];

/**
 * Locale the app opens in when nothing else selects one — no `?lang=`, no
 * stored choice, and a browser language we do not ship. Persian, since this is
 * an Iranian distribution; change this line to switch the out-of-the-box
 * language.
 */
export const DEFAULT_LOCALE =
  SUPPORTED_LOCALES.find(({ value }) => value === 'fa') ?? SUPPORTED_LOCALES[0];

/** Conventions of the given locale, falling back to the default one. */
export const localeSettings = (locale?: string): SupportedLocale =>
  SUPPORTED_LOCALES.find(({ value }) => value === locale) ?? DEFAULT_LOCALE;

export const getLanguages = (): Array<{ name: string; value: string }> =>
  SUPPORTED_LOCALES.map(({ value, nativeName, messageKey }) => ({
    name: intl.get(messageKey) || nativeName,
    value,
  }));
