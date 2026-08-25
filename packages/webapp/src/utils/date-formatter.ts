/**
 * Calendar-aware date formatting.
 *
 * The application stores and exchanges Gregorian dates everywhere — this module
 * is the single boundary where a date becomes text for the user, and where text
 * typed by the user becomes a `Date` again. Switching the UI to the Jalaali
 * calendar therefore only means switching the implementation picked here; no
 * value that reaches the API ever changes.
 */

import {
  formatJalaali,
  parseJalaali,
  toPersianDigits,
} from '@bigcapital/utils';
import moment from 'moment';

export type CalendarSystem = 'gregorian' | 'jalali';

export interface DateFormatterOptions {
  /** Calendar to render and parse in. Defaults to Gregorian. */
  calendar?: CalendarSystem;
  /** Render the result with Persian digit glyphs. */
  persianDigits?: boolean;
}

/** The prop shape Blueprint's `DateInput` expects. */
export interface DateInputFormatter {
  formatDate: (date: Date) => string;
  parseDate: (value: string) => Date | null;
  placeholder: string;
}

/**
 * Formats a date value with the given moment-style format in the requested
 * calendar. Invalid values format to an empty string rather than to moment's
 * "Invalid date" text.
 */
export function formatDateValue(
  value: Date | string | number | null | undefined,
  format: string,
  options: DateFormatterOptions = {},
): string {
  const { calendar = 'gregorian', persianDigits = false } = options;

  if (value === null || value === undefined || value === '') return '';

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  if (calendar === 'jalali') {
    return formatJalaali(date, format, { persianDigits });
  }
  const formatted = moment(date).format(format);

  return persianDigits ? toPersianDigits(formatted) : formatted;
}

/**
 * Parses user-typed text back into a `Date`, returning `null` when the input is
 * not a valid date in the requested calendar.
 */
export function parseDateValue(
  value: string,
  format: string,
  options: DateFormatterOptions = {},
): Date | null {
  const { calendar = 'gregorian' } = options;

  if (!value) return null;

  if (calendar === 'jalali') {
    return parseJalaali(value, format);
  }
  const parsed = moment(value, format);

  return parsed.isValid() ? parsed.toDate() : null;
}

/**
 * Builds the `formatDate`/`parseDate`/`placeholder` trio that date inputs take,
 * bound to the given format and calendar.
 */
export function dateFormatter(
  format: string,
  options: DateFormatterOptions = {},
): DateInputFormatter {
  return {
    formatDate: (date: Date) => formatDateValue(date, format, options),
    parseDate: (value: string) => parseDateValue(value, format, options),
    placeholder: format,
  };
}
