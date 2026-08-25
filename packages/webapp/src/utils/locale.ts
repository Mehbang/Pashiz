import intl from 'react-intl-universal';
import { localeSettings } from '@/constants/languagesOptions';
import { CURRENCIES, startOfJalaali, toPersianDigits } from '@bigcapital/utils';
import type { JalaaliDateUnit } from '@bigcapital/utils';
import moment from 'moment';
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

/**
 * Renders a bare number in the digits of the active locale.
 *
 * For counts that get interpolated into a translated sentence — "{due} days",
 * "{count} items" — where the surrounding text is Persian but the number would
 * otherwise arrive as Latin. Thousand separators are deliberately not applied;
 * use `formattedNumber()` for amounts.
 */
export const localizedDigits = (
  value: number | string | null | undefined,
): string => {
  if (value === null || value === undefined) return '';

  const text = String(value);
  return currentLocaleSettings().persianDigits ? toPersianDigits(text) : text;
};

/**
 * A currency written the way the active locale names it.
 *
 * Currency codes are what the interface falls back to when there is no room
 * for an amount — "Total (IRT)", the unit beside a discount field. A Persian
 * reader knows the unit as تومان, not as `IRT`, so the native name is used
 * whenever the currency has one written in Persian script. Currencies whose
 * native symbol is punctuation ($, €, ¥) keep their code, which reads better
 * in a label than a lone glyph.
 */
export const localizedCurrencyLabel = (code?: string): string => {
  if (!code) return '';

  const nativeSymbol = CURRENCIES[code]?.symbol_native;
  const isPersianScript = nativeSymbol
    ? /[\u0600-\u06FF]/.test(nativeSymbol)
    : false;

  return currentLocaleSettings().persianDigits && isPersianScript
    ? nativeSymbol
    : code;
};

/**
 * The first day of the period the given date falls in, as a Gregorian ISO
 * string — the format every report query travels in.
 *
 * Only the boundary follows the locale's calendar. A Persian organization
 * opening a yearly report should see it begin on 1 Farvardin rather than on
 * 1 January, but the value handed to the API stays what the API has always
 * taken.
 */
export const startOfPeriodLocalized = (
  unit: JalaaliDateUnit,
  date: Date = new Date(),
): string => {
  const { calendar } = currentLocaleSettings();

  const start =
    calendar === 'jalali'
      ? startOfJalaali(date, unit)
      : moment(date).startOf(unit).toDate();

  return moment(start).format('YYYY-MM-DD');
};
