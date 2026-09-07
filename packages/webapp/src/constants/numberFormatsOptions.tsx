import intl from 'react-intl-universal';
import { CURRENCIES, toPersianDigits } from '@bigcapital/utils';
import { currentLocaleSettings } from '@/utils/locale';

export const moneyFormat: Array<{ key: string; text: string }> = [
  { key: 'total', text: intl.get('total_rows') },
  { key: 'always', text: intl.get('always') },
  { key: 'none', text: intl.get('none') },
];

/**
 * One sample amount, written the way the application writes money.
 *
 * These menus used to show `$1000` and `$0.01` whatever the organization
 * trades in, so a Persian reader picking a decimal place was shown a currency
 * the books never use. Mirrors `formattedAmount()`: Persian names the currency
 * after the amount and in its own script, English puts the symbol in front.
 */
const sampleAmount = (digits: string, currencyCode?: string): string => {
  const { persianDigits } = currentLocaleSettings();
  const currency = currencyCode ? CURRENCIES[currencyCode] : undefined;
  const nativeSymbol = persianDigits ? currency?.symbol_native : undefined;
  const number = persianDigits ? toPersianDigits(digits) : digits;

  if (nativeSymbol) return `${number} ${nativeSymbol}`;

  const symbol = currency?.symbol ?? '';
  return symbol ? `${symbol}${number}` : number;
};

export const getNegativeFormats = (
  currencyCode?: string,
): Array<{ key: string; text: string }> => [
  { key: 'parentheses', text: `(${sampleAmount('1000', currencyCode)})` },
  { key: 'mines', text: `-${sampleAmount('1000', currencyCode)}` },
];

export const getDecimalPlaces = (
  currencyCode?: string,
): Array<{ text: string; key: number }> =>
  [0, 1, 2, 3, 4, 5].map((places) => ({
    key: places,
    text: sampleAmount(
      places === 0 ? '1' : `0.${'0'.repeat(places - 1)}1`,
      currencyCode,
    ),
  }));
