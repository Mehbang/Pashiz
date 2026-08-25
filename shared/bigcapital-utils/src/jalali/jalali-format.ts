/**
 * Moment-compatible formatting and parsing for the Jalaali calendar.
 *
 * The app's date format settings (`DD MMM YYYY`, `YYYY/MM/DD`, ...) are moment
 * format strings, so the Jalaali layer speaks the same token language. That way
 * an organization's configured date format keeps working unchanged when the
 * locale switches to Persian.
 */

import { toLatinDigits, toPersianDigits } from "./digits";
import {
  dateToJalaali,
  isValidJalaaliDate,
  jalaaliMonthLength,
  jalaaliToDate,
} from "./jalali";

export const JALAALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

/** Weekdays ordered the Persian way — the week starts on Saturday. */
export const JALAALI_WEEKDAYS = [
  "شنبه",
  "یک‌شنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
];

export const JALAALI_WEEKDAYS_SHORT = [
  "شنبه",
  "یک",
  "دو",
  "سه",
  "چهار",
  "پنج",
  "جمعه",
];

export const JALAALI_WEEKDAYS_MIN = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

/**
 * Index of the given date in `JALAALI_WEEKDAYS`. JS weeks start on Sunday (0)
 * while Persian weeks start on Saturday, hence the shift.
 */
export function jalaaliWeekdayIndex(date: Date): number {
  return (date.getDay() + 1) % 7;
}

/**
 * Supported format tokens, longest first so `YYYY` wins over `YY`. The
 * lowercase `yyyy`/`yy` spellings are included because the organization date
 * format options on the server use them (`DD/MM/yyyy`, `yyyy/MM/DD`).
 */
const TOKEN_PATTERN =
  /\[([^\]]*)\]|YYYY|yyyy|YY|yy|MMMM|MMM|MM|M|DD|D|dddd|ddd|dd|HH|hh|mm|ss|SSS|A|a/g;

const pad = (value: number, length = 2): string =>
  String(value).padStart(length, "0");

export interface FormatJalaaliOptions {
  /** Render the result with Persian digit glyphs (`۱۴۰۵` instead of `1405`). */
  persianDigits?: boolean;
}

/**
 * Formats the given date as a Jalaali date using a moment-style format string.
 * The date is read in local time so the calendar day matches the user's day.
 */
export function formatJalaali(
  date: Date,
  format: string,
  options: FormatJalaaliOptions = {},
): string {
  const { jy, jm, jd } = dateToJalaali(date);
  const weekday = jalaaliWeekdayIndex(date);
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  const formatted = format.replace(TOKEN_PATTERN, (token, literal) => {
    // `[...]` escapes its content out of token substitution.
    if (literal !== undefined) return literal;

    switch (token) {
      case "YYYY":
      case "yyyy":
        return pad(jy, 4);
      case "YY":
      case "yy":
        return pad(jy % 100);
      case "MMMM":
      case "MMM":
        // Persian month names have no conventional abbreviation, so the short
        // and long forms are the same.
        return JALAALI_MONTHS[jm - 1];
      case "MM":
        return pad(jm);
      case "M":
        return String(jm);
      case "DD":
        return pad(jd);
      case "D":
        return String(jd);
      case "dddd":
        return JALAALI_WEEKDAYS[weekday];
      case "ddd":
        return JALAALI_WEEKDAYS_SHORT[weekday];
      case "dd":
        return JALAALI_WEEKDAYS_MIN[weekday];
      case "HH":
        return pad(hours24);
      case "hh":
        return pad(hours12);
      case "mm":
        return pad(date.getMinutes());
      case "ss":
        return pad(date.getSeconds());
      case "SSS":
        return pad(date.getMilliseconds(), 3);
      case "A":
        return hours24 < 12 ? "ق.ظ" : "ب.ظ";
      case "a":
        return hours24 < 12 ? "ق.ظ" : "ب.ظ";
      default:
        return token;
    }
  });
  return options.persianDigits ? toPersianDigits(formatted) : formatted;
}

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Separators are matched interchangeably so a user may type `1405-06-02` even
 * when the configured format uses slashes.
 */
const SEPARATOR_PATTERN = "[\\/\\-.\\s]";

interface ParsedFields {
  jy?: number;
  jm?: number;
  jd?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  meridiem?: "am" | "pm";
}

/** Expands a two-digit Jalaali year into the 1300–1499 window. */
const expandTwoDigitYear = (value: number): number =>
  value < 50 ? 1400 + value : 1300 + value;

/**
 * Builds a matcher for the given moment-style format: a regular expression plus
 * the ordered list of fields its capture groups map to.
 */
function buildMatcher(format: string): {
  regex: RegExp;
  fields: Array<keyof ParsedFields | null>;
} {
  const fields: Array<keyof ParsedFields | null> = [];
  let pattern = "";
  let lastIndex = 0;

  const monthNames = JALAALI_MONTHS.map(escapeRegExp).join("|");
  const weekdayNames = [
    ...JALAALI_WEEKDAYS,
    ...JALAALI_WEEKDAYS_SHORT,
    ...JALAALI_WEEKDAYS_MIN,
  ]
    .map(escapeRegExp)
    .join("|");

  TOKEN_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_PATTERN.exec(format)) !== null) {
    // Literal text between tokens, with separators made interchangeable.
    const between = format.slice(lastIndex, match.index);
    pattern += escapeRegExp(between).replace(
      /\\?[\/\-.]|\s+/g,
      SEPARATOR_PATTERN,
    );
    lastIndex = match.index + match[0].length;

    const [token, literal] = match;

    if (literal !== undefined) {
      pattern += escapeRegExp(literal);
      continue;
    }
    switch (token) {
      case "YYYY":
      case "yyyy":
        pattern += "(\\d{4})";
        fields.push("jy");
        break;
      case "YY":
      case "yy":
        pattern += "(\\d{2})";
        fields.push("jy");
        break;
      case "MMMM":
      case "MMM":
        pattern += `(${monthNames})`;
        fields.push("jm");
        break;
      case "MM":
      case "M":
        pattern += "(\\d{1,2})";
        fields.push("jm");
        break;
      case "DD":
      case "D":
        pattern += "(\\d{1,2})";
        fields.push("jd");
        break;
      case "HH":
      case "hh":
        pattern += "(\\d{1,2})";
        fields.push("hours");
        break;
      case "mm":
        pattern += "(\\d{1,2})";
        fields.push("minutes");
        break;
      case "ss":
        pattern += "(\\d{1,2})";
        fields.push("seconds");
        break;
      case "SSS":
        pattern += "\\d{1,3}";
        break;
      case "A":
      case "a":
        pattern += "(ق\\.ظ|ب\\.ظ|[APap][Mm])";
        fields.push("meridiem");
        break;
      case "dddd":
      case "ddd":
      case "dd":
        // Weekday names carry no information we need — match and discard.
        pattern += `(?:${weekdayNames})`;
        break;
      default:
        pattern += escapeRegExp(token);
    }
  }
  pattern += escapeRegExp(format.slice(lastIndex)).replace(
    /\\?[\/\-.]|\s+/g,
    SEPARATOR_PATTERN,
  );

  return { regex: new RegExp(`^\\s*${pattern}\\s*$`), fields };
}

const matcherCache = new Map<
  string,
  { regex: RegExp; fields: Array<keyof ParsedFields | null> }
>();

function getMatcher(format: string) {
  let matcher = matcherCache.get(format);

  if (!matcher) {
    matcher = buildMatcher(format);
    matcherCache.set(format, matcher);
  }
  return matcher;
}

/**
 * Parses a Jalaali date string written in the given moment-style format and
 * returns the equivalent Gregorian `Date`, or `null` when the input is not a
 * real Jalaali date.
 */
export function parseJalaali(input: string, format: string): Date | null {
  if (!input) return null;

  const normalized = toLatinDigits(input).trim();
  const { regex, fields } = getMatcher(format);
  const match = regex.exec(normalized);

  if (!match) return null;

  const parsed: ParsedFields = {};

  fields.forEach((field, index) => {
    if (!field) return;
    const raw = match[index + 1];
    if (raw === undefined) return;

    if (field === "jm") {
      const monthIndex = JALAALI_MONTHS.indexOf(raw);
      parsed.jm = monthIndex >= 0 ? monthIndex + 1 : Number(raw);
    } else if (field === "meridiem") {
      parsed.meridiem = /ق\.ظ|[Aa][Mm]/.test(raw) ? "am" : "pm";
    } else {
      parsed[field] = Number(raw);
    }
  });
  const today = dateToJalaali(new Date());

  // A format may omit fields (e.g. `MM/YYYY`); fall back to today's values.
  const jy =
    parsed.jy === undefined
      ? today.jy
      : String(parsed.jy).length <= 2
        ? expandTwoDigitYear(parsed.jy)
        : parsed.jy;
  const jm = parsed.jm ?? today.jm;
  const jd = parsed.jd ?? 1;

  if (!isValidJalaaliDate(jy, jm, jd)) return null;

  let hours = parsed.hours ?? 0;

  if (parsed.meridiem === "pm" && hours < 12) hours += 12;
  if (parsed.meridiem === "am" && hours === 12) hours = 0;

  return jalaaliToDate(jy, jm, jd, {
    hours,
    minutes: parsed.minutes ?? 0,
    seconds: parsed.seconds ?? 0,
  });
}

export interface JalaaliMonthCell {
  date: Date;
  /** Day of the Jalaali month, 1-based. */
  jd: number;
}

/**
 * Lays a Jalaali month out as calendar weeks starting on Saturday. Cells that
 * fall outside the month are `null` so every row keeps seven columns.
 */
export function buildJalaaliMonthGrid(
  jy: number,
  jm: number,
): Array<Array<JalaaliMonthCell | null>> {
  const leading = jalaaliWeekdayIndex(jalaaliToDate(jy, jm, 1));
  const monthLength = jalaaliMonthLength(jy, jm);

  const cells: Array<JalaaliMonthCell | null> = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: monthLength }, (_, index) => ({
      date: jalaaliToDate(jy, jm, index + 1),
      jd: index + 1,
    })),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return Array.from({ length: cells.length / 7 }, (_, row) =>
    cells.slice(row * 7, row * 7 + 7),
  );
}

/** Steps a Jalaali year/month pair by the given number of months. */
export function addJalaaliMonths(
  jy: number,
  jm: number,
  delta: number,
): { jy: number; jm: number } {
  const total = jy * 12 + (jm - 1) + delta;

  return { jy: Math.floor(total / 12), jm: (total % 12) + 1 };
}
