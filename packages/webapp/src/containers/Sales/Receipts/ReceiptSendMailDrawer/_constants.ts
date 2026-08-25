import intl from 'react-intl-universal';
export const defaultReceiptMailProps = {
  companyLogoUri: 'https://via.placeholder.com/150',
  companyName: intl.get('company_name'),
  receiptNumber: '1234',
  total: '1000',
  message: intl.get('thank_you_for_your_business'),
  items: [
    { label: intl.get('item_1'), quantity: 1, total: '500' },
    { label: intl.get('item_2'), quantity: 2, total: '500' },
  ],
  subtotal: '1000',
  showViewReceiptButton: true,
  viewReceiptButtonLabel: intl.get('view_receipt'),
};
