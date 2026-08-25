import { dateRangeFromToCollection } from './date-range-collection';

describe('dateRangeFromToCollection() — Gregorian', () => {
  it('breaks a range on calendar months', () => {
    const ranges = dateRangeFromToCollection(
      '2026-01-15',
      '2026-03-10',
      'month',
    );

    expect(ranges).toEqual([
      { fromDate: '2026-01-01', toDate: '2026-01-31' },
      { fromDate: '2026-02-01', toDate: '2026-02-28' },
      { fromDate: '2026-03-01', toDate: '2026-03-31' },
    ]);
  });
});

describe('dateRangeFromToCollection() — Jalaali', () => {
  it('breaks a range on Jalaali months, not Gregorian ones', () => {
    // 23 August 2026 is 1 Shahrivar 1405; the period must run to 22 September,
    // the last day of Shahrivar, rather than to 31 August.
    const ranges = dateRangeFromToCollection(
      '2026-08-23',
      '2026-10-01',
      'month',
      1,
      'jalali',
    );

    expect(ranges).toEqual([
      { fromDate: '2026-08-23', toDate: '2026-09-22' },
      { fromDate: '2026-09-23', toDate: '2026-10-22' },
    ]);
  });

  it('snaps a mid-month start back to the beginning of its Jalaali month', () => {
    const ranges = dateRangeFromToCollection(
      '2026-08-30',
      '2026-09-10',
      'month',
      1,
      'jalali',
    );

    expect(ranges).toEqual([{ fromDate: '2026-08-23', toDate: '2026-09-22' }]);
  });

  it('breaks a range on Jalaali quarters', () => {
    // The Jalaali year 1405 begins on 21 March 2026.
    const ranges = dateRangeFromToCollection(
      '2026-03-21',
      '2027-03-20',
      'quarter',
      1,
      'jalali',
    );

    expect(ranges).toEqual([
      { fromDate: '2026-03-21', toDate: '2026-06-21' },
      { fromDate: '2026-06-22', toDate: '2026-09-22' },
      { fromDate: '2026-09-23', toDate: '2026-12-21' },
      { fromDate: '2026-12-22', toDate: '2027-03-20' },
    ]);
  });

  it('breaks a range on Jalaali years', () => {
    const ranges = dateRangeFromToCollection(
      '2026-05-01',
      '2027-05-01',
      'year',
      1,
      'jalali',
    );

    expect(ranges).toEqual([
      { fromDate: '2026-03-21', toDate: '2027-03-20' },
      { fromDate: '2027-03-21', toDate: '2028-03-19' },
    ]);
  });

  it('covers a leap Jalaali year to its 366th day', () => {
    // 1403 runs from 20 March 2024 to 20 March 2025 — Esfand has 30 days.
    const ranges = dateRangeFromToCollection(
      '2024-06-01',
      '2024-07-01',
      'year',
      1,
      'jalali',
    );

    expect(ranges).toEqual([{ fromDate: '2024-03-20', toDate: '2025-03-20' }]);
  });

  it('breaks weeks on Saturday', () => {
    const ranges = dateRangeFromToCollection(
      '2026-08-24',
      '2026-09-01',
      'week',
      1,
      'jalali',
    );

    expect(ranges).toEqual([
      { fromDate: '2026-08-22', toDate: '2026-08-28' },
      { fromDate: '2026-08-29', toDate: '2026-09-04' },
    ]);
  });

  it('returns each day of a short daily range', () => {
    const ranges = dateRangeFromToCollection(
      '2026-08-24',
      '2026-08-26',
      'day',
      1,
      'jalali',
    );

    expect(ranges).toEqual([
      { fromDate: '2026-08-24', toDate: '2026-08-24' },
      { fromDate: '2026-08-25', toDate: '2026-08-25' },
      { fromDate: '2026-08-26', toDate: '2026-08-26' },
    ]);
  });

  it('terminates instead of looping when the increment is not positive', () => {
    const ranges = dateRangeFromToCollection(
      '2026-08-23',
      '2026-09-30',
      'month',
      0,
      'jalali',
    );

    expect(ranges).toHaveLength(2);
  });
});
