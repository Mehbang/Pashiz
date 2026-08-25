import * as moment from 'moment';
import {
  CalendarSystem,
  JalaaliDateUnit,
  addJalaali,
  endOfJalaali,
  isSameJalaali,
  startOfJalaali,
} from './jalali-date';

/** Formats a date as `YYYY-MM-DD` in local time, the way moment does. */
const toIsoDay = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const dateRangeCollection = (
  fromDate,
  toDate,
  addType: moment.unitOfTime.StartOf = 'day',
  increment: number = 1,
) => {
  const collection = [];
  const momentFromDate = moment(fromDate);
  let dateFormat = '';

  switch (addType) {
    case 'day':
    default:
      dateFormat = 'YYYY-MM-DD';
      break;
    case 'month':
    case 'quarter':
      dateFormat = 'YYYY-MM';
      break;
    case 'year':
      dateFormat = 'YYYY';
      break;
  }
  for (
    let i = momentFromDate;
    i.isBefore(toDate, addType) || i.isSame(toDate, addType);
    i.add(increment, `${addType}s` as moment.unitOfTime.DurationConstructor)
  ) {
    collection.push(i.endOf(addType).format(dateFormat));
  }
  return collection;
};

/**
 * Walks the range one Jalaali period at a time. Period boundaries follow the
 * Persian calendar (Farvardin…Esfand), while the dates themselves stay
 * Gregorian so the rest of the reporting pipeline is unaffected.
 */
const jalaaliRangeFromToCollection = (
  fromDate: moment.MomentInput,
  toDate: moment.MomentInput,
  unit: JalaaliDateUnit,
  increment: number,
) => {
  const collection = [];
  const rangeEnd = moment(toDate).toDate();
  let cursor = startOfJalaali(moment(fromDate).toDate(), unit);

  // A non-positive increment would never advance the cursor.
  const step = increment > 0 ? increment : 1;

  while (
    cursor.getTime() <= rangeEnd.getTime() ||
    isSameJalaali(cursor, rangeEnd, unit)
  ) {
    collection.push({
      fromDate: toIsoDay(cursor),
      toDate: toIsoDay(endOfJalaali(cursor, unit)),
    });
    cursor = startOfJalaali(addJalaali(cursor, step, unit), unit);
  }
  return collection;
};

export const dateRangeFromToCollection = (
  fromDate: moment.MomentInput,
  toDate: moment.MomentInput,
  addType: moment.unitOfTime.StartOf = 'day',
  increment: number = 1,
  calendar: CalendarSystem = 'gregorian',
) => {
  if (calendar === 'jalali') {
    return jalaaliRangeFromToCollection(
      fromDate,
      toDate,
      addType as JalaaliDateUnit,
      increment,
    );
  }
  const collection = [];
  const momentFromDate = moment(fromDate);
  const dateFormat = 'YYYY-MM-DD';

  for (
    let i = momentFromDate;
    i.isBefore(toDate, addType) || i.isSame(toDate, addType);
    i.add(increment, `${addType}s` as moment.unitOfTime.DurationConstructor)
  ) {
    collection.push({
      fromDate: i.startOf(addType).format(dateFormat),
      toDate: i.endOf(addType).format(dateFormat),
    });
  }
  return collection;
};
