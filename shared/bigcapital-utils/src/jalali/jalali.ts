/**
 * Jalaali (Solar Hijri / Shamsi) calendar support.
 *
 * The calendar arithmetic below is the reference Jalaali algorithm (the same
 * one used by `jalaali-js`, MIT, by Behrang Norouzinia). It is inlined rather
 * than added as a dependency so the date layer stays dependency-free, and it is
 * accurate for Jalaali years -61 to 3177 — far beyond any accounting horizon.
 *
 * Everything in this module is pure: the application keeps storing and sending
 * Gregorian `Date`/ISO values, and Jalaali is applied only at the presentation
 * boundary (formatting for display, parsing user input back to a `Date`).
 */

export interface JalaaliDate {
  jy: number;
  jm: number;
  jd: number;
}

export interface GregorianDate {
  gy: number;
  gm: number;
  gd: number;
}

/**
 * Jalaali years that start the 33-year leap cycle rule. Each entry marks the
 * first year of a new arithmetic period in the Birashk/Borkowski scheme.
 */
const BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192,
  2262, 2324, 2394, 2456, 3178,
];

const MIN_JALAALI_YEAR = BREAKS[0];
const MAX_JALAALI_YEAR = BREAKS[BREAKS.length - 1];

/** Integer division that truncates towards zero (matches the reference algorithm). */
const div = (a: number, b: number): number => Math.trunc(a / b);

/** Modulo that follows the sign of the dividend (matches the reference algorithm). */
const mod = (a: number, b: number): number => a - Math.trunc(a / b) * b;

const assertJalaaliYear = (jy: number): void => {
  if (jy < MIN_JALAALI_YEAR || jy >= MAX_JALAALI_YEAR) {
    throw new RangeError(`Invalid Jalaali year ${jy}`);
  }
};

/**
 * Number of years since the last leap year of the given Jalaali year:
 * `0` means the year itself is a leap year.
 */
function jalCalLeap(jy: number): number {
  assertJalaaliYear(jy);

  let jp = BREAKS[0];
  let jump = 0;

  for (let i = 1; i < BREAKS.length; i += 1) {
    const jm = BREAKS[i];
    jump = jm - jp;
    if (jy < jm) break;
    jp = jm;
  }
  let n = jy - jp;

  if (jump - n < 6) {
    n = n - jump + div(jump + 4, 33) * 33;
  }
  let leap = mod(mod(n + 1, 33) - 1, 4);

  if (leap === -1) {
    leap = 4;
  }
  return leap;
}

/**
 * Calendar constants of the given Jalaali year: whether it is a leap year, its
 * matching Gregorian year, and the March day on which 1 Farvardin falls.
 */
function jalCal(jy: number): { leap: number; gy: number; march: number } {
  assertJalaaliYear(jy);

  const gy = jy + 621;
  let leapJ = -14;
  let jp = BREAKS[0];
  let jump = 0;

  for (let i = 1; i < BREAKS.length; i += 1) {
    const jm = BREAKS[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  const n = jy - jp;

  // Leap years from AD 621 to the beginning of the current Jalaali year.
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) {
    leapJ += 1;
  }
  // ... and the same count in the Gregorian calendar.
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;

  return { leap: jalCalLeap(jy), gy, march: 20 + leapJ - leapG };
}

/** Julian Day Number of a Gregorian date. */
function g2d(gy: number, gm: number, gd: number): number {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

/** Gregorian date of a Julian Day Number. */
function d2g(jdn: number): GregorianDate {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

/** Julian Day Number of a Jalaali date. */
function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

/** Jalaali date of a Julian Day Number. */
function d2j(jdn: number): JalaaliDate {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);

  // Days elapsed since 1 Farvardin.
  let k = jdn - jdn1f;

  if (k >= 0) {
    if (k <= 185) {
      // The first six months are 31 days each.
      return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
    }
    k -= 186;
  } else {
    // The date falls in the previous Jalaali year.
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
}

/** Whether the given Jalaali year is a leap year (Esfand has 30 days). */
export function isLeapJalaaliYear(jy: number): boolean {
  return jalCalLeap(jy) === 0;
}

/** Number of days in the given Jalaali month. */
export function jalaaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isLeapJalaaliYear(jy) ? 30 : 29;
}

/** Whether the given Jalaali year/month/day triple is a real calendar date. */
export function isValidJalaaliDate(
  jy: number,
  jm: number,
  jd: number,
): boolean {
  return (
    jy >= MIN_JALAALI_YEAR &&
    jy < MAX_JALAALI_YEAR &&
    jm >= 1 &&
    jm <= 12 &&
    jd >= 1 &&
    jd <= jalaaliMonthLength(jy, jm)
  );
}

/** Converts a Gregorian year/month/day triple to its Jalaali equivalent. */
export function toJalaali(gy: number, gm: number, gd: number): JalaaliDate {
  return d2j(g2d(gy, gm, gd));
}

/** Converts a Jalaali year/month/day triple to its Gregorian equivalent. */
export function toGregorian(jy: number, jm: number, jd: number): GregorianDate {
  return d2g(j2d(jy, jm, jd));
}

/**
 * Converts a JS `Date` to a Jalaali date, reading the date in local time so the
 * calendar day matches what the user sees.
 */
export function dateToJalaali(date: Date): JalaaliDate {
  return toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/**
 * Converts a Jalaali date to a JS `Date` at local midnight, optionally carrying
 * over the time-of-day of a reference date.
 */
export function jalaaliToDate(
  jy: number,
  jm: number,
  jd: number,
  time?: { hours?: number; minutes?: number; seconds?: number },
): Date {
  const { gy, gm, gd } = toGregorian(jy, jm, jd);

  return new Date(
    gy,
    gm - 1,
    gd,
    time?.hours ?? 0,
    time?.minutes ?? 0,
    time?.seconds ?? 0,
    0,
  );
}
