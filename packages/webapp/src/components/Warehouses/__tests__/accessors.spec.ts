import intl from 'react-intl-universal';
import { afterEach, describe, expect, it } from 'vitest';
import { warehouseCodeAccessor } from '../accessors';

const useLocale = (currentLocale: string) =>
  intl.init({ currentLocale, locales: { [currentLocale]: {} } });

afterEach(() => useLocale('en'));

describe('warehouseCodeAccessor()', () => {
  it('reads the code in the digits of the locale', async () => {
    await useLocale('fa');

    expect(warehouseCodeAccessor({ code: '10001' })).toBe('۱۰۰۰۱');
  });

  it('survives having no warehouse at all', async () => {
    await useLocale('fa');

    // The select hands a function accessor `null` for as long as nothing is
    // chosen, which is the starting state of every new invoice, bill, receipt
    // and estimate. Reading `.code` off that took the whole form down.
    expect(warehouseCodeAccessor(null)).toBe('');
    expect(warehouseCodeAccessor(undefined)).toBe('');
    expect(warehouseCodeAccessor({ code: null })).toBe('');
  });

  it('leaves the digits Latin in English', async () => {
    await useLocale('en');

    expect(warehouseCodeAccessor({ code: '10001' })).toBe('10001');
  });
});
