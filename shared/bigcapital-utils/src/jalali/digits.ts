/**
 * Helpers for switching between Latin (`0-9`), Persian (`۰-۹`) and Arabic-Indic
 * (`٠-٩`) digit glyphs.
 *
 * Persian digits are a display concern only: values that travel to the API, to
 * `Date` parsing or to any numeric computation must always be normalised back
 * to Latin digits with `toLatinDigits()` first.
 */

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

const PERSIAN_TO_LATIN = /[۰-۹]/g;
const ARABIC_TO_LATIN = /[٠-٩]/g;
const LATIN_DIGITS = /[0-9]/g;

/** Replaces Latin digits with Persian ones, leaving everything else untouched. */
export function toPersianDigits(value: string | number): string {
  return String(value ?? "").replace(
    LATIN_DIGITS,
    (digit) => PERSIAN_DIGITS[Number(digit)],
  );
}

/**
 * Replaces Persian and Arabic-Indic digits with Latin ones. Also normalises the
 * Arabic decimal separator and thousands separator so pasted numbers parse.
 */
export function toLatinDigits(value: string | number): string {
  return String(value ?? "")
    .replace(PERSIAN_TO_LATIN, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(ARABIC_TO_LATIN, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/٫/g, ".")
    .replace(/٬/g, ",");
}

/** Whether the given string contains any Persian or Arabic-Indic digit. */
export function hasNonLatinDigits(value: string): boolean {
  return /[۰-۹٠-٩]/.test(value);
}

export { PERSIAN_DIGITS, ARABIC_DIGITS };
