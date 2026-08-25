import intl from 'react-intl-universal';
import { afterEach, describe, expect, it } from 'vitest';
import { localizedCurrencyLabel, localizedDigits } from '../locale';

const useLocale = (currentLocale: string) =>
  intl.init({ currentLocale, locales: { [currentLocale]: {} } });

afterEach(() => useLocale('en'));

describe('localizedDigits()', () => {
  it('leaves the digits Latin in English', async () => {
    await useLocale('en');

    expect(localizedDigits(0)).toBe('0');
    expect(localizedDigits(12)).toBe('12');
  });

  it('renders the digits in Persian', async () => {
    await useLocale('fa');

    expect(localizedDigits(0)).toBe('۰');
    expect(localizedDigits(12)).toBe('۱۲');
  });

  it('renders nothing for an absent count', async () => {
    await useLocale('fa');

    expect(localizedDigits(null)).toBe('');
    expect(localizedDigits(undefined)).toBe('');
  });

  it('does not add thousand separators', async () => {
    await useLocale('fa');

    expect(localizedDigits(1234)).toBe('۱۲۳۴');
  });
});

describe('localizedCurrencyLabel()', () => {
  it('keeps the code in English', async () => {
    await useLocale('en');

    expect(localizedCurrencyLabel('IRT')).toBe('IRT');
    expect(localizedCurrencyLabel('USD')).toBe('USD');
  });

  it('names the Iranian currencies in Persian', async () => {
    await useLocale('fa');

    expect(localizedCurrencyLabel('IRT')).toBe('تومان');
    expect(localizedCurrencyLabel('IRR')).toBe('ریال');
  });

  it('keeps the code for currencies whose symbol is punctuation', async () => {
    await useLocale('fa');

    // "Total ($)" reads worse than "Total (USD)"; only currencies with a name
    // written in Persian gain anything from the substitution.
    expect(localizedCurrencyLabel('USD')).toBe('USD');
    expect(localizedCurrencyLabel('EUR')).toBe('EUR');
  });

  it('renders nothing for an absent or unknown currency', async () => {
    await useLocale('fa');

    expect(localizedCurrencyLabel(undefined)).toBe('');
    expect(localizedCurrencyLabel('ZZZ')).toBe('ZZZ');
  });
});
