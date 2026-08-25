import { formatJalaali } from '@bigcapital/utils';
import * as moment from 'moment';

// The period arithmetic lives in the shared package so the webapp can compute
// the same boundaries; it is re-exported here because the server has always
// imported it from this module.
export {
  startOfJalaali,
  endOfJalaali,
  addJalaali,
  isSameJalaali,
} from '@bigcapital/utils';
export type { JalaaliDateUnit } from '@bigcapital/utils';

export type CalendarSystem = 'gregorian' | 'jalali';

/** Organization languages whose reports are read in the Jalaali calendar. */
const JALAALI_LANGUAGES = ['fa'];

/**
 * The calendar an organization reads its reports in, derived from the language
 * it is configured with.
 */
export function calendarOfLanguage(language?: string): CalendarSystem {
  return language && JALAALI_LANGUAGES.includes(language)
    ? 'jalali'
    : 'gregorian';
}

/**
 * Whether an organization reading in the given language expects Persian digits
 * (۱۲۳) rather than Latin ones. Kept separate from the calendar because it
 * applies to money and plain numbers too, not only to dates.
 */
export function usesPersianDigits(language?: string): boolean {
  return calendarOfLanguage(language) === 'jalali';
}

/**
 * Formats a date for display in the given calendar, using a moment-style format
 * string so organization date-format settings apply to both calendars.
 *
 * Only the human-readable half of a report is affected: every machine-readable
 * date the API returns stays a Gregorian ISO value.
 */
export function formatDateIn(
  date: moment.MomentInput,
  format: string,
  calendar: CalendarSystem = 'gregorian',
  { persianDigits = true }: { persianDigits?: boolean } = {},
): string {
  if (calendar === 'jalali') {
    return formatJalaali(moment(date).toDate(), format, { persianDigits });
  }
  return moment(date).format(format);
}
