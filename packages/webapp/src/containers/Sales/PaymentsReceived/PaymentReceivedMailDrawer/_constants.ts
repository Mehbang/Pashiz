import intl from 'react-intl-universal';
export const defaultPaymentReceiptMailProps = {
  companyName: intl.get('company_name'),
  companyLogoUri: 'https://via.placeholder.com/150',
  primaryColor: 'rgb(0, 82, 204)',
  paymentDate: '2021-01-01',
  paymentDateLabel: intl.get('payment_date'),
  total: '100.00',
  totalLabel: intl.get('total'),
  paymentNumber: '123456',
  paymentNumberLabel: intl.get('payment_2'),
  message: intl.get('thank_you_for_your_payment'),
  subtotal: '100.00',
  subtotalLabel: intl.get('subtotal'),
  items: [{ label: intl.get('invoice_1'), total: '100.00' }],
};
