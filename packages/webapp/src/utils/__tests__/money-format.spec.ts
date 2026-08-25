import intl from 'react-intl-universal';
import { afterEach, describe, expect, it } from 'vitest';
import { formattedAmount, formattedNumber } from '../index';

/**
 * Switches the globally held locale the formatters read their conventions from.
 *
 * Note the thousands separator stays the Latin comma even in Persian: only the
 * digits are localised, which is what Iranian accounting software conventionally
 * does and avoids depending on font support for U+066C.
 */
const useLocale = (currentLocale: string) =>
  intl.init({ currentLocale, locales: { [currentLocale]: {} } });

afterEach(() => useLocale('en'));

describe('formattedAmount()', () => {
  it('puts the symbol in front with Latin digits in English', async () => {
    await useLocale('en');

    expect(formattedAmount(1234.5, 'USD')).toBe('$1,234.50');
  });

  it('puts the currency name after the amount in Persian', async () => {
    await useLocale('fa');

    expect(formattedAmount(1234, 'IRT')).toBe('۱,۲۳۴ تومان');
    expect(formattedAmount(1234, 'IRR')).toBe('۱,۲۳۴ ریال');
  });

  it('quotes the rial and the toman in whole units', async () => {
    await useLocale('fa');

    // js-money declares two decimal places for the rial; the app corrects that.
    expect(formattedAmount(1500, 'IRR')).toBe('۱,۵۰۰ ریال');
  });

  it('keeps the minus sign ahead of a negative Persian amount', async () => {
    await useLocale('fa');

    expect(formattedAmount(-250, 'IRT')).toBe('-۲۵۰ تومان');
  });

  it('falls back to Latin digits and no symbol for an unknown currency', async () => {
    await useLocale('en');

    expect(formattedAmount(99, 'ZZZ')).toBe('99');
  });
});

describe('formattedNumber()', () => {
  it('renders Latin digits in English', async () => {
    await useLocale('en');

    expect(formattedNumber(9876, {})).toBe('9,876');
  });

  it('renders Persian digits in Persian', async () => {
    await useLocale('fa');

    expect(formattedNumber(9876, {})).toBe('۹,۸۷۶');
  });
});
