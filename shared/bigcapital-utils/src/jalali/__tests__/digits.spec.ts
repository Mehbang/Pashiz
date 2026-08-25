import { describe, expect, it } from "vitest";
import { hasNonLatinDigits, toLatinDigits, toPersianDigits } from "../digits";

describe("toPersianDigits()", () => {
  it("converts Latin digits and leaves the rest alone", () => {
    expect(toPersianDigits("1405/06/02")).toBe("۱۴۰۵/۰۶/۰۲");
    expect(toPersianDigits("فاکتور 12")).toBe("فاکتور ۱۲");
  });

  it("accepts numbers", () => {
    expect(toPersianDigits(2026)).toBe("۲۰۲۶");
  });
});

describe("toLatinDigits()", () => {
  it("converts Persian digits", () => {
    expect(toLatinDigits("۱۴۰۵/۰۶/۰۲")).toBe("1405/06/02");
  });

  it("converts Arabic-Indic digits and separators", () => {
    expect(toLatinDigits("١٢٣٤٥")).toBe("12345");
    expect(toLatinDigits("١٢٬٣٤٥٫٦٧")).toBe("12,345.67");
  });

  it("is a no-op on Latin input", () => {
    expect(toLatinDigits("1405/06/02")).toBe("1405/06/02");
  });
});

describe("hasNonLatinDigits()", () => {
  it("detects Persian and Arabic-Indic digits", () => {
    expect(hasNonLatinDigits("۱۴۰۵")).toBe(true);
    expect(hasNonLatinDigits("١٢٣")).toBe(true);
    expect(hasNonLatinDigits("1405")).toBe(false);
  });
});
