import { dateToJalaali, jalaaliMonthLength, jalaaliToDate } from "./jalali";

/** Units of time the report period logic works in. */
export type JalaaliDateUnit = 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Jalaali calendar arithmetic for report periods.
 *
 * Reports still store, query and return Gregorian dates; these helpers only
 * decide *where the period boundaries fall*. A monthly profit/loss for a
 * Persian organization has to break on Farvardin/Ordibehesht rather than on
 * March/April, which is what `startOf`/`endOf` below express.
 */

/** The Jalaali week begins on Saturday, which JS reports as day 6. */
const jalaaliWeekdayIndex = (date: Date): number => (date.getDay() + 1) % 7;

/** First Jalaali month of the quarter the given month falls in. */
const startMonthOfQuarter = (jm: number): number =>
  Math.floor((jm - 1) / 3) * 3 + 1;

const atStartOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

const atEndOfDay = (date: Date): Date =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );

/**
 * Start of the Jalaali period the given date belongs to.
 */
export function startOfJalaali(date: Date, unit: JalaaliDateUnit): Date {
  const { jy, jm } = dateToJalaali(date);

  switch (unit) {
    case 'week': {
      const start = new Date(date);
      start.setDate(start.getDate() - jalaaliWeekdayIndex(date));
      return atStartOfDay(start);
    }
    case 'month':
      return jalaaliToDate(jy, jm, 1);
    case 'quarter':
      return jalaaliToDate(jy, startMonthOfQuarter(jm), 1);
    case 'year':
      return jalaaliToDate(jy, 1, 1);
    case 'day':
    default:
      return atStartOfDay(date);
  }
}

/**
 * End of the Jalaali period the given date belongs to, down to the millisecond.
 */
export function endOfJalaali(date: Date, unit: JalaaliDateUnit): Date {
  const { jy, jm } = dateToJalaali(date);

  switch (unit) {
    case 'week': {
      const end = new Date(date);
      end.setDate(end.getDate() + (6 - jalaaliWeekdayIndex(date)));
      return atEndOfDay(end);
    }
    case 'month':
      return atEndOfDay(jalaaliToDate(jy, jm, jalaaliMonthLength(jy, jm)));
    case 'quarter': {
      const lastMonth = startMonthOfQuarter(jm) + 2;
      return atEndOfDay(
        jalaaliToDate(jy, lastMonth, jalaaliMonthLength(jy, lastMonth)),
      );
    }
    case 'year':
      return atEndOfDay(jalaaliToDate(jy, 12, jalaaliMonthLength(jy, 12)));
    case 'day':
    default:
      return atEndOfDay(date);
  }
}

/**
 * Steps the given date forward (or backward) by whole Jalaali periods. Day-of-
 * month is clamped so that, say, 31 Farvardin + 1 month lands on 31 Ordibehesht
 * but 31 Shahrivar + 1 month lands on 30 Mehr.
 */
export function addJalaali(
  date: Date,
  amount: number,
  unit: JalaaliDateUnit,
): Date {
  if (unit === 'day' || unit === 'week') {
    const shifted = new Date(date);
    shifted.setDate(shifted.getDate() + amount * (unit === 'week' ? 7 : 1));
    return shifted;
  }
  const monthsPerUnit = { month: 1, quarter: 3, year: 12 }[unit];
  const { jy, jm, jd } = dateToJalaali(date);
  const total = jy * 12 + (jm - 1) + amount * monthsPerUnit;
  const nextYear = Math.floor(total / 12);
  const nextMonth = (total % 12) + 1;

  return jalaaliToDate(
    nextYear,
    nextMonth,
    Math.min(jd, jalaaliMonthLength(nextYear, nextMonth)),
    {
      hours: date.getHours(),
      minutes: date.getMinutes(),
      seconds: date.getSeconds(),
    },
  );
}

/** Whether both dates fall in the same Jalaali period. */
export function isSameJalaali(
  left: Date,
  right: Date,
  unit: JalaaliDateUnit,
): boolean {
  return (
    startOfJalaali(left, unit).getTime() ===
    startOfJalaali(right, unit).getTime()
  );
}
