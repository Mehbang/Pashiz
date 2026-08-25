// `js-money` ships no type declarations; the currency table is a plain map of
// currency code to its metadata.
declare module "js-money/lib/currency" {
  interface JsMoneyCurrency {
    symbol: string;
    name: string;
    symbol_native: string;
    decimal_digits: number;
    rounding: number;
    code: string;
    name_plural: string;
  }
  const currencies: Record<string, JsMoneyCurrency>;
  export default currencies;
}
