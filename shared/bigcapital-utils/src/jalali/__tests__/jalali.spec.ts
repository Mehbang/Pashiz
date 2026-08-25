import { describe, expect, it } from "vitest";
import {
  dateToJalaali,
  isLeapJalaaliYear,
  isValidJalaaliDate,
  jalaaliMonthLength,
  jalaaliToDate,
  toGregorian,
  toJalaali,
} from "../jalali";

describe("toGregorian()", () => {
  it.each([
    [1399, 1, 1, { gy: 2020, gm: 3, gd: 20 }],
    [1400, 1, 1, { gy: 2021, gm: 3, gd: 21 }],
    [1403, 1, 1, { gy: 2024, gm: 3, gd: 20 }],
    [1405, 1, 1, { gy: 2026, gm: 3, gd: 21 }],
  ])("converts Nowruz of %i to its Gregorian date", (jy, jm, jd, expected) => {
    expect(toGregorian(jy, jm, jd)).toEqual(expected);
  });

  it("converts the last day of a leap Esfand", () => {
    expect(toGregorian(1403, 12, 30)).toEqual({ gy: 2025, gm: 3, gd: 20 });
  });
});

describe("toJalaali()", () => {
  it("converts a Gregorian date to its Jalaali equivalent", () => {
    expect(toJalaali(2026, 8, 24)).toEqual({ jy: 1405, jm: 6, jd: 2 });
  });
});

describe("round trip", () => {
  it("survives every day between 1990 and 2060", () => {
    const mismatches: string[] = [];

    for (
      const cursor = new Date(1990, 0, 1);
      cursor < new Date(2060, 0, 1);
      cursor.setDate(cursor.getDate() + 1)
    ) {
      const { jy, jm, jd } = dateToJalaali(cursor);
      const back = toGregorian(jy, jm, jd);

      if (
        back.gy !== cursor.getFullYear() ||
        back.gm !== cursor.getMonth() + 1 ||
        back.gd !== cursor.getDate()
      ) {
        mismatches.push(cursor.toDateString());
      }
    }
    expect(mismatches).toEqual([]);
  });
});

describe("isLeapJalaaliYear()", () => {
  it.each([
    [1399, true],
    [1400, false],
    [1403, true],
    [1404, false],
  ])("reports %i correctly", (jy, expected) => {
    expect(isLeapJalaaliYear(jy)).toBe(expected);
  });
});

describe("jalaaliMonthLength()", () => {
  it("gives 31 days to the first six months", () => {
    expect(jalaaliMonthLength(1405, 1)).toBe(31);
    expect(jalaaliMonthLength(1405, 6)).toBe(31);
  });

  it("gives 30 days to months seven through eleven", () => {
    expect(jalaaliMonthLength(1405, 7)).toBe(30);
    expect(jalaaliMonthLength(1405, 11)).toBe(30);
  });

  it("gives Esfand 30 days only in a leap year", () => {
    expect(jalaaliMonthLength(1403, 12)).toBe(30);
    expect(jalaaliMonthLength(1404, 12)).toBe(29);
  });
});

describe("isValidJalaaliDate()", () => {
  it("rejects Esfand 30 of a common year", () => {
    expect(isValidJalaaliDate(1404, 12, 30)).toBe(false);
  });

  it("accepts Esfand 30 of a leap year", () => {
    expect(isValidJalaaliDate(1403, 12, 30)).toBe(true);
  });

  it("rejects out-of-range months and days", () => {
    expect(isValidJalaaliDate(1405, 13, 1)).toBe(false);
    expect(isValidJalaaliDate(1405, 0, 1)).toBe(false);
    expect(isValidJalaaliDate(1405, 1, 32)).toBe(false);
    expect(isValidJalaaliDate(1405, 1, 0)).toBe(false);
  });
});

describe("jalaaliToDate()", () => {
  it("builds a local-midnight date by default", () => {
    const date = jalaaliToDate(1405, 6, 2);

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7);
    expect(date.getDate()).toBe(24);
    expect(date.getHours()).toBe(0);
  });

  it("carries over the given time of day", () => {
    const date = jalaaliToDate(1405, 6, 2, { hours: 13, minutes: 45 });

    expect(date.getHours()).toBe(13);
    expect(date.getMinutes()).toBe(45);
  });
});
