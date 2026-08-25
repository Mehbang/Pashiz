import { JALAALI_MONTHS } from '@bigcapital/utils';
import intl from 'react-intl-universal';
import type { CalendarSystem } from '@/utils/date-formatter';

const GREGORIAN_MONTH_KEYS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

/**
 * Jalaali month keys, stored in the same lowercase-name form the Gregorian
 * options use so the setting stays a readable string on the server.
 */
const JALAALI_MONTH_KEYS = [
  'farvardin',
  'ordibehesht',
  'khordad',
  'tir',
  'mordad',
  'shahrivar',
  'mehr',
  'aban',
  'azar',
  'dey',
  'bahman',
  'esfand',
];

/**
 * Fiscal year options — twelve windows, each named for the month it opens on
 * and the month it closes on, in the calendar the organization works in.
 */
export const getFiscalYear = (
  calendar: CalendarSystem = 'gregorian',
): Array<{ name: string; key: string }> => {
  const isJalaali = calendar === 'jalali';
  const keys = isJalaali ? JALAALI_MONTH_KEYS : GREGORIAN_MONTH_KEYS;
  const monthName = (index: number) =>
    isJalaali ? JALAALI_MONTHS[index] : intl.get(GREGORIAN_MONTH_KEYS[index]);

  return keys.map((key, index) => ({
    // A fiscal year that opens in month N closes in the month before it.
    name: `${monthName(index)} - ${monthName((index + 11) % 12)}`,
    key,
  }));
};
