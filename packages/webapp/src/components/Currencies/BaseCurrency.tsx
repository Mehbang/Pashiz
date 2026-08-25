// @ts-nocheck
import React from 'react';
import { CurrencyTag } from '@/components';
import { localizedCurrencyLabel } from '@/utils/locale';

/**
 * base currecncy.
 * @returns
 */
export function BaseCurrency({ currency }) {
  return <CurrencyTag>{localizedCurrencyLabel(currency)}</CurrencyTag>;
}
