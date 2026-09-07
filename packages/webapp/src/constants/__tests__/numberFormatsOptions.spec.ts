import intl from 'react-intl-universal';
import { afterEach, describe, expect, it } from 'vitest';
import { getDecimalPlaces, getNegativeFormats } from '../numberFormatsOptions';

const useLocale = (currentLocale: string) =>
  intl.init({ currentLocale, locales: { [currentLocale]: {} } });

afterEach(() => useLocale('en'));

describe('getDecimalPlaces()', () => {
  it('writes the sample in the currency the books are kept in', async () => {
    await useLocale('fa');

    const texts = getDecimalPlaces('IRT').map((option) => option.text);

    expect(texts).toEqual([
      '۱ تومان',
      '۰.۱ تومان',
      '۰.۰۱ تومان',
      '۰.۰۰۱ تومان',
      '۰.۰۰۰۱ تومان',
      '۰.۰۰۰۰۱ تومان',
    ]);
  });

  it('keeps the leading symbol in English', async () => {
    await useLocale('en');

    const texts = getDecimalPlaces('USD').map((option) => option.text);

    expect(texts.slice(0, 3)).toEqual(['$1', '$0.1', '$0.01']);
  });

  it('falls back to a bare number when the currency is unknown', async () => {
    await useLocale('fa');

    expect(getDecimalPlaces(undefined)[2].text).toBe('۰.۰۱');
  });
});

describe('getNegativeFormats()', () => {
  it('follows the same currency', async () => {
    await useLocale('fa');

    expect(getNegativeFormats('IRT').map((option) => option.text)).toEqual([
      '(۱۰۰۰ تومان)',
      '-۱۰۰۰ تومان',
    ]);
  });

  it('reads as dollars in English', async () => {
    await useLocale('en');

    expect(getNegativeFormats('USD').map((option) => option.text)).toEqual([
      '($1000)',
      '-$1000',
    ]);
  });
});
