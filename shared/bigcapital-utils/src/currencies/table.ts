import jsMoneyCurrencies from "js-money/lib/currency";

export interface CurrencyDefinition {
  symbol: string;
  name: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  code: string;
  name_plural: string;
}

/**
 * Currencies that `js-money` either does not ship or defines inaccurately.
 */
const OVERRIDING_CURRENCIES: Record<string, CurrencyDefinition> = {
  // js-money gives the rial two decimal places, but it is quoted and recorded
  // in whole units.
  IRR: {
    ...(jsMoneyCurrencies.IRR as CurrencyDefinition),
    symbol_native: "ریال",
    decimal_digits: 0,
  },
  // The toman is the unit Iranians actually price in — ten rials. It has no
  // ISO 4217 code of its own, so the widely used unofficial `IRT` stands in.
  //
  // Names here stay English: this table is data shared with the server, and the
  // display name is translated where it is shown (`constants/currencies.tsx`).
  IRT: {
    symbol: "IRT",
    name: "Iranian Toman",
    symbol_native: "تومان",
    decimal_digits: 0,
    rounding: 0,
    code: "IRT",
    name_plural: "Iranian tomans",
  },
};

/**
 * The currency table the application works from: everything `js-money` knows,
 * with the corrections above applied.
 */
export const CURRENCIES: Record<string, CurrencyDefinition> = {
  ...(jsMoneyCurrencies as Record<string, CurrencyDefinition>),
  ...OVERRIDING_CURRENCIES,
};
