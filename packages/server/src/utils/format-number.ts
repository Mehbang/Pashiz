import * as accounting from 'accounting';
import { CURRENCIES, toPersianDigits } from '@bigcapital/utils';

/**
 * Wraps the positive pattern in whatever the requested negative style is, so
 * the symbol keeps its side of the amount in both calendars.
 */
const getNegativeFormat = (formatName: string, positive: string) => {
  switch (formatName) {
    case 'parentheses':
      return `(${positive})`;
    case 'mines':
      return `-${positive}`;
  }
};

export interface IFormatNumberSettings {
  precision?: number;
  divideOn1000?: boolean;
  excerptZero?: boolean;
  negativeFormat?: string;
  thousand?: string;
  decimal?: string;
  zeroSign?: string;
  money?: boolean;
  currencyCode?: string;
  symbol?: string;
  /** Render the digits as Persian (۱۲۳) and name the currency in its own script. */
  persianDigits?: boolean;

  /**
   * Show only the decimals the value actually has. For quantities, where a
   * fixed scale prints `۳٫۰۰` for three of something.
   */
  trimTrailingZeros?: boolean;
}

/** Quantities are stored to three decimal places; none of them is worth more. */
const MAX_QUANTITY_DECIMALS = 3;

/**
 * How many decimal places this value really needs, once trailing zeros are
 * discounted — `5` needs none, `5.5` needs one, `5.125` needs three.
 */
const decimalsOf = (value: unknown, max: number): number => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return 0;

  const rounded = Number(amount.toFixed(max));
  const [, fraction = ''] = String(rounded).split('.');

  return Math.min(fraction.replace(/0+$/, '').length, max);
};

export const formatNumber = (
  balance,
  {
    precision,
    divideOn1000 = false,
    excerptZero = false,
    negativeFormat = 'mines',
    thousand = ',',
    decimal = '.',
    zeroSign = '',
    money = true,
    currencyCode,
    symbol = '',
    persianDigits = false,
    trimTrailingZeros = false,
  }: IFormatNumberSettings,
) => {
  const currency = currencyCode ? CURRENCIES[currencyCode] : undefined;

  // Persian names the currency after the amount ("۱۲,۳۴۵ تومان") and in its own
  // script, where English puts the symbol in front ("$12,345"). Mirrors
  // `formattedAmount()` in the webapp so both render an amount identically.
  const nativeSymbol = persianDigits ? currency?.symbol_native : undefined;
  const currencySymbol = nativeSymbol || currency?.symbol || '';
  const trailingSymbol = money && Boolean(nativeSymbol);

  const format = trailingSymbol ? '%v %s' : '%s%v';
  const negFormat = getNegativeFormat(negativeFormat, format);

  // The rial and the toman are quoted in whole units; only fall back to two
  // decimal places when the currency is unknown.
  //
  // A counted amount is not money and has no fixed scale: three kilograms are
  // three, not three point zero zero. `trimTrailingZeros` asks for exactly the
  // decimals the number turns out to have, so a half stays a half and a whole
  // number reads as one.
  const digits =
    precision ??
    (money
      ? (currency?.decimal_digits ?? 2)
      : trimTrailingZeros
        ? decimalsOf(balance, MAX_QUANTITY_DECIMALS)
        : 2);

  let formattedBalance = parseFloat(balance);

  if (divideOn1000) {
    formattedBalance /= 1000;
  }
  const formatted = accounting.formatMoney(
    formattedBalance,
    money ? currencySymbol : symbol ? symbol : '',
    digits,
    thousand,
    decimal,
    {
      pos: format,
      neg: negFormat,
      zero: excerptZero ? zeroSign : format,
    },
  );
  return persianDigits ? toPersianDigits(formatted) : formatted;
};
