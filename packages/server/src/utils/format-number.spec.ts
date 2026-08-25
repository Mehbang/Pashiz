import { formatNumber } from './format-number';

describe('formatNumber', () => {
  describe('Latin locales', () => {
    it('puts the symbol in front of the amount', () => {
      expect(formatNumber(1234.5, { currencyCode: 'USD' })).toEqual(
        '$1,234.50',
      );
    });

    it('keeps the minus ahead of the symbol', () => {
      expect(formatNumber(-1234.5, { currencyCode: 'USD' })).toEqual(
        '-$1,234.50',
      );
    });

    it('wraps a negative in parentheses when asked', () => {
      expect(
        formatNumber(-1234.5, {
          currencyCode: 'USD',
          negativeFormat: 'parentheses',
        }),
      ).toEqual('($1,234.50)');
    });

    it('formats a plain number without a currency', () => {
      expect(formatNumber(1234.5, { money: false })).toEqual('1,234.50');
    });

    it('honours an explicitly requested precision', () => {
      expect(
        formatNumber(1234.567, { currencyCode: 'USD', precision: 3 }),
      ).toEqual('$1,234.567');
    });
  });

  describe('Persian organizations', () => {
    it('names the currency after the amount, in Persian digits', () => {
      expect(
        formatNumber(2750, { currencyCode: 'IRT', persianDigits: true }),
      ).toEqual('۲,۷۵۰ تومان');
    });

    it('quotes the rial in whole units', () => {
      // js-money declares two decimal places for the rial; the app corrects it.
      expect(
        formatNumber(1500, { currencyCode: 'IRR', persianDigits: true }),
      ).toEqual('۱,۵۰۰ ریال');
    });

    it('keeps the minus sign ahead of a negative amount', () => {
      expect(
        formatNumber(-250, { currencyCode: 'IRT', persianDigits: true }),
      ).toEqual('-۲۵۰ تومان');
    });

    it('renders a plain number in Persian digits without a symbol', () => {
      expect(
        formatNumber(1234.5, { money: false, persianDigits: true }),
      ).toEqual('۱,۲۳۴.۵۰');
    });

    it('trails a foreign currency too, matching the webapp', () => {
      // Persian reads the currency after the amount whatever the currency is;
      // `formattedAmount()` in the webapp renders this identically.
      expect(
        formatNumber(1234.5, { currencyCode: 'USD', persianDigits: true }),
      ).toEqual('۱,۲۳۴.۵۰ $');
    });
  });

  it('falls back to two decimals and no symbol for an unknown currency', () => {
    expect(formatNumber(99, { currencyCode: 'ZZZ' })).toEqual('99.00');
  });
});
