import intl from 'react-intl-universal';
import { TaxType } from '@/interfaces/TaxRates';

export const InclusiveTaxOptions = [
  { key: TaxType.Inclusive, label: intl.get('inclusive_of_tax') },
  { key: TaxType.Exclusive, label: intl.get('exclusive_of_tax') },
];
