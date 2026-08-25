import intl from 'react-intl-universal';
export const initialValues = {
  templateName: '',

  // Colors
  primaryColor: '#2c3dd8',
  secondaryColor: '#2c3dd8',

  // Company logo.
  showCompanyLogo: true,
  companyLogoUri: '',
  companyLogoKey: '',

  // Top details.
  showPaymentReceivedNumber: true,
  paymentReceivedNumberLabel: intl.get('payment_no_'),

  // Payment number
  showPaymentReceivedDate: true,
  paymentReceivedDateLabel: intl.get('date_of_issue'),

  // Customer address
  showCompanyAddress: true,

  // Company address
  showCustomerAddress: true,
  billedToLabel: intl.get('billed_to'),

  // Entries
  itemNameLabel: intl.get('item'),
  itemDescriptionLabel: intl.get('description'),
  itemRateLabel: intl.get('rate'),
  itemTotalLabel: intl.get('total'),

  // Subtotal
  showSubtotal: true,
  subtotalLabel: intl.get('subtotal'),

  // Total
  showTotal: true,
  totalLabel: intl.get('total'),
};

export const fieldsGroups = [
  {
    label: intl.get('header'),
    fields: [
      {
        labelKey: 'paymentReceivedNumberLabel',
        enableKey: 'showPaymentReceivedNumber',
        label: intl.get('payment_no'),
      },
      {
        labelKey: 'paymentReceivedDateLabel',
        enableKey: 'showPaymentReceivedDate',
        label: intl.get('payment_date'),
      },
      {
        enableKey: 'showCustomerAddress',
        labelKey: 'billedToLabel',
        label: intl.get('bill_to'),
      },
      {
        enableKey: 'showCompanyAddress',
        label: intl.get('billed_from'),
      },
    ],
  },
  {
    label: intl.get('totals'),
    fields: [
      {
        labelKey: 'subtotalLabel',
        enableKey: 'showSubtotal',
        label: intl.get('subtotal'),
      },
      {
        labelKey: 'totalLabel',
        enableKey: 'showTotal',
        label: intl.get('total'),
      },
    ],
  },
];
