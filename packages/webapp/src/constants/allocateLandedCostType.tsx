import intl from 'react-intl-universal';

export const AllocateLandedCostType: Array<{ name: string; value: string }> = [
  { name: intl.get('bills'), value: intl.get('resource_bill_singular') },
  { name: intl.get('expenses'), value: intl.get('expense') },
];
