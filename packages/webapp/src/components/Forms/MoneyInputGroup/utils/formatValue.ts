// @ts-nocheck
import { toPersianDigits } from '@bigcapital/utils';
import { addSeparators } from './addSeparators';

type Props = {
  /**
   * Value to format
   */
  value: number | string | undefined;

  /**
   * Decimal separator
   *
   * Default = '.'
   */
  decimalSeparator?: string;

  /**
   * Group separator
   *
   * Default = ','
   */
  groupSeparator?: string;

  /**
   * Turn off separators
   *
   * This will override Group separators
   *
   * Default = false
   */
  turnOffSeparators?: boolean;

  /**
   * Prefix
   */
  prefix?: string;

  /**
   * Render the digits as Persian (۱۲۳).
   *
   * Display only — `cleanValue()` turns them back into Latin before the value
   * reaches the form.
   */
  persianDigits?: boolean;
};

/**
 * Format value with decimal separator, group separator and prefix
 */
export const formatValue = (props: Props): string => {
  const {
    value: _value,
    groupSeparator = ',',
    decimalSeparator = '.',
    turnOffSeparators = false,
    prefix,
    persianDigits = false,
  } = props;

  if (_value === '' || _value === undefined) {
    return '';
  }

  const value = String(_value);

  if (value === '-') {
    return '-';
  }

  const isNegative = RegExp('^-\\d+').test(value);
  const hasDecimalSeparator =
    decimalSeparator && value.includes(decimalSeparator);

  const valueOnly = isNegative ? value.replace('-', '') : value;
  const [int, decimals] = hasDecimalSeparator
    ? valueOnly.split(decimalSeparator)
    : [valueOnly];

  const formattedInt = turnOffSeparators
    ? int
    : addSeparators(int, groupSeparator);

  const includePrefix = prefix ? prefix : '';
  const includeNegative = isNegative ? '-' : '';
  const includeDecimals =
    hasDecimalSeparator && decimals
      ? `${decimalSeparator}${decimals}`
      : hasDecimalSeparator
        ? `${decimalSeparator}`
        : '';

  const formatted = `${includeNegative}${includePrefix}${formattedInt}${includeDecimals}`;

  return persianDigits ? toPersianDigits(formatted) : formatted;
};
