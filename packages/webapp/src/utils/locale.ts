import intl from 'react-intl-universal';
import { localeSettings } from '@/constants/languagesOptions';
import { formatDateValue } from './date-formatter';

/**
 * Locale conventions for code that runs outside React and so cannot read
 * `useAppIntlContext()` — number and money formatting, validation messages,
 * table cell accessors. The active locale is read back from
 * `react-intl-universal`, which already holds it globally, rather than kept in
 * a second piece of state.
 */
export const currentLocaleSettings = () =>
  localeSettings(intl.getInitOptions()?.currentLocale);

/**
 * Formats a date for display in the calendar and digits of the active locale.
 *
 * Use this only for text the user reads. Dates that travel to the API must keep
 * using `moment(...).format('YYYY-MM-DD')` so the wire format stays Gregorian.
 */
export const formatDateLocalized = (
  value: Date | string | number | null | undefined,
  format: string,
): string => {
  const { calendar, persianDigits } = currentLocaleSettings();

  return formatDateValue(value, format, { calendar, persianDigits });
};
