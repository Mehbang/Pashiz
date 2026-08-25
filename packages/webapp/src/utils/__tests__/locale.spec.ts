import intl from 'react-intl-universal';
import { afterEach, describe, expect, it } from 'vitest';
import {
  localizedCurrencyLabel,
  localizedDigits,
  startOfPeriodLocalized,
} from '../locale';

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

describe('startOfPeriodLocalized()', () => {
  // 2026-08-25 is 3 Shahrivar 1405: inside Jalaali year 1405, which opened on
  // 2026-03-21, and inside Shahrivar, which opened on 2026-08-23.
  const date = new Date(2026, 7, 25);

  it('uses the Gregorian boundary in English', async () => {
    await useLocale('en');

    expect(startOfPeriodLocalized('year', date)).toBe('2026-01-01');
    expect(startOfPeriodLocalized('month', date)).toBe('2026-08-01');
  });

  it('uses the Jalaali boundary in Persian', async () => {
    await useLocale('fa');

    // 1 Farvardin 1405 and 1 Shahrivar 1405.
    expect(startOfPeriodLocalized('year', date)).toBe('2026-03-21');
    expect(startOfPeriodLocalized('month', date)).toBe('2026-08-23');
  });

  it('returns a Gregorian ISO string in both, which is what the API takes', async () => {
    await useLocale('fa');

    expect(startOfPeriodLocalized('year', date)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
