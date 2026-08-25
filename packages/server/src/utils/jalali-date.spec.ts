import {
  addJalaali,
  calendarOfLanguage,
  endOfJalaali,
  formatDateIn,
  isSameJalaali,
  startOfJalaali,
} from './jalali-date';

/** 24 August 2026 is 2 Shahrivar 1405 — a Monday. */
const SUBJECT = new Date(2026, 7, 24);

const day = (date: Date) => date.toDateString();

describe('startOfJalaali()', () => {
  it('starts the month on 1 Shahrivar, not on 1 August', () => {
    expect(day(startOfJalaali(SUBJECT, 'month'))).toBe(
      day(new Date(2026, 7, 23)),
    );
  });

  it('starts the quarter on 1 Tir, the first month of Q2', () => {
    expect(day(startOfJalaali(SUBJECT, 'quarter'))).toBe(
      day(new Date(2026, 5, 22)),
    );
  });

  it('starts the year on Nowruz', () => {
    expect(day(startOfJalaali(SUBJECT, 'year'))).toBe(
      day(new Date(2026, 2, 21)),
    );
  });

  it('starts the week on Saturday', () => {
    expect(day(startOfJalaali(SUBJECT, 'week'))).toBe(
      day(new Date(2026, 7, 22)),
    );
  });

  it('starts the day at midnight', () => {
    const noon = new Date(2026, 7, 24, 12, 30);

    expect(startOfJalaali(noon, 'day').getHours()).toBe(0);
  });
});

describe('endOfJalaali()', () => {
  it('ends the month on the last day of Shahrivar', () => {
    expect(day(endOfJalaali(SUBJECT, 'month'))).toBe(
      day(new Date(2026, 8, 22)),
    );
  });

  it('ends the quarter on the last day of Shahrivar', () => {
    expect(day(endOfJalaali(SUBJECT, 'quarter'))).toBe(
      day(new Date(2026, 8, 22)),
    );
  });

  it('ends the year on the eve of Nowruz', () => {
    expect(day(endOfJalaali(SUBJECT, 'year'))).toBe(day(new Date(2027, 2, 20)));
  });

  it('accounts for the extra day of a leap Esfand', () => {
    // 1403 is a leap Jalaali year, so Esfand runs to 30 days.
    const inLeapYear = new Date(2024, 6, 1);

    expect(day(endOfJalaali(inLeapYear, 'year'))).toBe(
      day(new Date(2025, 2, 20)),
    );
  });

  it('runs to the last millisecond of the day', () => {
    const end = endOfJalaali(SUBJECT, 'month');

    expect([end.getHours(), end.getMinutes(), end.getSeconds()]).toEqual([
      23, 59, 59,
    ]);
  });
});

describe('addJalaali()', () => {
  it('steps whole Jalaali months', () => {
    // 2 Shahrivar + 1 month is 2 Mehr, which falls on 24 September.
    expect(day(addJalaali(SUBJECT, 1, 'month'))).toBe(
      day(new Date(2026, 8, 24)),
    );
  });

  it('clamps the day when the next month is shorter', () => {
    // 31 Shahrivar + 1 month has to land on 30 Mehr, which has no 31st.
    const lastOfShahrivar = new Date(2026, 8, 22);
    const next = addJalaali(lastOfShahrivar, 1, 'month');

    expect(day(next)).toBe(day(new Date(2026, 9, 22)));
  });

  it('steps quarters and years', () => {
    expect(day(addJalaali(SUBJECT, 1, 'quarter'))).toBe(
      day(new Date(2026, 10, 23)),
    );
    expect(day(addJalaali(SUBJECT, 1, 'year'))).toBe(
      day(new Date(2027, 7, 24)),
    );
  });
});

describe('isSameJalaali()', () => {
  it('groups two dates that share a Jalaali month but not a Gregorian one', () => {
    // 23 August and 5 September are both in Shahrivar.
    expect(
      isSameJalaali(new Date(2026, 7, 23), new Date(2026, 8, 5), 'month'),
    ).toBe(true);
  });

  it('separates dates that share a Gregorian month but not a Jalaali one', () => {
    // 22 August is Mordad, 23 August is Shahrivar.
    expect(
      isSameJalaali(new Date(2026, 7, 22), new Date(2026, 7, 23), 'month'),
    ).toBe(false);
  });
});

describe('calendarOfLanguage()', () => {
  it.each([
    ['fa', 'jalali'],
    ['en', 'gregorian'],
    ['ar', 'gregorian'],
    [undefined, 'gregorian'],
  ])('maps %s to %s', (language, expected) => {
    expect(calendarOfLanguage(language)).toBe(expected);
  });
});

describe('formatDateIn()', () => {
  it('formats in the Gregorian calendar by default', () => {
    expect(formatDateIn(SUBJECT, 'YYYY-MM-DD')).toBe('2026-08-24');
  });

  it('formats in the Jalaali calendar with Persian digits', () => {
    expect(formatDateIn(SUBJECT, 'YYYY-MM-DD', 'jalali')).toBe('۱۴۰۵-۰۶-۰۲');
  });
});
