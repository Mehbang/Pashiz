import intl from 'react-intl-universal';
export const modalChargeOptions: Array<{ name: string; value: string }> = [
  { name: intl.get('hourly_rate'), value: intl.get('hourly_rate') },
  { name: intl.get('fixed_price'), value: intl.get('fixed_price') },
  { name: intl.get('non_chargeable'), value: intl.get('non_chargeable') },
];
