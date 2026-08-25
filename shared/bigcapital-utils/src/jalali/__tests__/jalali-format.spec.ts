import { describe, expect, it } from "vitest";
import {
  addJalaaliMonths,
  buildJalaaliMonthGrid,
  formatJalaali,
  parseJalaali,
} from "../jalali-format";

/** The date format options offered by the server's organization settings. */
const ORGANIZATION_DATE_FORMATS = [
  "MM/DD/YY",
  "DD/MM/YY",
  "YY/MM/DD",
  "MM/DD/yyyy",
  "DD/MM/yyyy",
  "yyyy/MM/DD",
  "DD MMM YYYY",
  "DD MMMM YYYY",
  "MMMM DD, YYYY",
];

/** 24 August 2026 — a Monday — is 2 Shahrivar 1405. */
const SUBJECT = new Date(2026, 7, 24);

describe("formatJalaali()", () => {
  it.each([
    ["DD MMM YYYY", "02 شهریور 1405"],
    ["DD MMMM YYYY", "02 شهریور 1405"],
    ["yyyy/MM/DD", "1405/06/02"],
    ["MM/DD/YY", "06/02/05"],
    ["MMMM DD, YYYY", "شهریور 02, 1405"],
    ["dddd", "دوشنبه"],
    ["D M YYYY", "2 6 1405"],
  ])("formats %s", (format, expected) => {
    expect(formatJalaali(SUBJECT, format)).toBe(expected);
  });

  it("renders Persian digits on request", () => {
    expect(formatJalaali(SUBJECT, "yyyy/MM/DD", { persianDigits: true })).toBe(
      "۱۴۰۵/۰۶/۰۲",
    );
  });

  it("leaves bracketed text out of token substitution", () => {
    expect(formatJalaali(SUBJECT, "[سال] YYYY")).toBe("سال 1405");
  });

  it("formats the time of day", () => {
    const evening = new Date(2026, 7, 24, 19, 5, 9);

    expect(formatJalaali(evening, "HH:mm:ss")).toBe("19:05:09");
    expect(formatJalaali(evening, "hh:mm A")).toBe("07:05 ب.ظ");
  });
});

describe("parseJalaali()", () => {
  it("reads back everything formatJalaali() writes", () => {
    const mismatches: string[] = [];

    ORGANIZATION_DATE_FORMATS.forEach((format) => {
      for (
        const cursor = new Date(2022, 0, 1);
        cursor < new Date(2028, 0, 1);
        cursor.setDate(cursor.getDate() + 1)
      ) {
        const formatted = formatJalaali(cursor, format);
        const parsed = parseJalaali(formatted, format);

        if (parsed?.toDateString() !== cursor.toDateString()) {
          mismatches.push(`${format} :: ${formatted}`);
        }
      }
    });
    expect(mismatches).toEqual([]);
  });

  it("accepts any separator regardless of the configured one", () => {
    expect(parseJalaali("1405-06-02", "yyyy/MM/DD")).toEqual(SUBJECT);
  });

  it("accepts Persian digits", () => {
    expect(parseJalaali("۱۴۰۵/۰۶/۰۲", "yyyy/MM/DD")).toEqual(SUBJECT);
  });

  it("accepts a Persian month name", () => {
    expect(parseJalaali("02 شهریور 1405", "DD MMM YYYY")).toEqual(SUBJECT);
  });

  it("expands a two-digit year into the 1300–1499 window", () => {
    expect(parseJalaali("06/02/05", "MM/DD/YY")).toEqual(SUBJECT);
  });

  it("rejects Esfand 30 of a common year", () => {
    expect(parseJalaali("1404/12/30", "yyyy/MM/DD")).toBeNull();
  });

  it("accepts Esfand 30 of a leap year", () => {
    expect(parseJalaali("1403/12/30", "yyyy/MM/DD")).toEqual(
      new Date(2025, 2, 20),
    );
  });

  it.each(["", "hello", "1405/13/01", "1405/01/32"])("rejects %j", (input) => {
    expect(parseJalaali(input, "yyyy/MM/DD")).toBeNull();
  });
});

describe("buildJalaaliMonthGrid()", () => {
  it("pads the first row so the month starts on its real weekday", () => {
    // 1 Farvardin 1405 is 21 March 2026, a Saturday — the first column.
    const weeks = buildJalaaliMonthGrid(1405, 1);

    expect(weeks[0][0]?.jd).toBe(1);
    expect(weeks[0][0]?.date).toEqual(new Date(2026, 2, 21));
  });

  it("offsets a month that does not start on Saturday", () => {
    // 1 Shahrivar 1405 is 23 August 2026, a Sunday — the second column.
    const weeks = buildJalaaliMonthGrid(1405, 6);

    expect(weeks[0][0]).toBeNull();
    expect(weeks[0][1]?.jd).toBe(1);
  });

  it("lays out every day of the month exactly once", () => {
    const days = buildJalaaliMonthGrid(1405, 6)
      .flat()
      .filter(Boolean)
      .map((cell) => cell!.jd);

    expect(days).toEqual(Array.from({ length: 31 }, (_, i) => i + 1));
  });

  it("gives Esfand 30 days in a leap year and 29 otherwise", () => {
    const leap = buildJalaaliMonthGrid(1403, 12).flat().filter(Boolean);
    const common = buildJalaaliMonthGrid(1404, 12).flat().filter(Boolean);

    expect(leap).toHaveLength(30);
    expect(common).toHaveLength(29);
  });

  it("keeps every row seven columns wide", () => {
    const weeks = buildJalaaliMonthGrid(1405, 6);

    weeks.forEach((week) => expect(week).toHaveLength(7));
  });
});

describe("addJalaaliMonths()", () => {
  it("steps forward and backward within a year", () => {
    expect(addJalaaliMonths(1405, 6, 2)).toEqual({ jy: 1405, jm: 8 });
    expect(addJalaaliMonths(1405, 6, -2)).toEqual({ jy: 1405, jm: 4 });
  });

  it("rolls over the year boundary in both directions", () => {
    expect(addJalaaliMonths(1405, 12, 1)).toEqual({ jy: 1406, jm: 1 });
    expect(addJalaaliMonths(1405, 1, -1)).toEqual({ jy: 1404, jm: 12 });
  });
});
