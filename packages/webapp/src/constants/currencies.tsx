import { sortBy } from 'lodash';
import intl from 'react-intl-universal';
import { CURRENCIES } from '@bigcapital/utils';

export interface CurrencyOption {
  name: string;
  code: string;
}

export const getCurrencies = (): CurrencyOption[] => [
  { name: intl.get('us_dollar'), code: 'USD' },
  { name: intl.get('euro'), code: 'EUR' },
  { name: intl.get('libyan_diner'), code: 'LYD' },
  { name: intl.get('iranian_rial'), code: 'IRR' },
  { name: intl.get('iranian_toman'), code: 'IRT' },
];

export const getAllCurrenciesOptions = (): Array<{
  key: string;
  name: string;
}> => {
  const codes = Object.keys(CURRENCIES);
  const sortedCodes = sortBy(codes);

  return sortedCodes.map((code) => {
    const currency = CURRENCIES[code];

    return {
      key: code,
      name: `${code} - ${currency.name}`,
    };
  });
};
