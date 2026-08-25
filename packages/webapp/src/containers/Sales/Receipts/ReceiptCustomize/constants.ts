import intl from 'react-intl-universal';
export const initialValues = {
  templateName: '',

  // Colors
  primaryColor: '#2c3dd8',
  secondaryColor: '#2c3dd8',

  // Company logo.
  showCompanyLogo: true,
  companyLogoKey: '',
  companyLogoUri: '',

  // Receipt Number
  showReceiptNumber: true,
  receiptNumberLabel: intl.get('receipt_no_'),

  // Receipt Date
  showReceiptDate: true,
  receiptDateLabel: intl.get('date_of_issue'),

  // Customer address
  showCustomerAddress: true,

  // Company address
  showCompanyAddress: true,
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

  // Terms & Conditions
  termsConditionsLabel: intl.get('terms_conditions'),
  showTermsConditions: true,

  // Customer Note
  customerNoteLabel: intl.get('customer_note'),
  showCustomerNote: true,
};

export const fieldsGroups = [
  {
    label: intl.get('header'),
    fields: [
      {
        labelKey: 'receiptNumberLabel',
        enableKey: 'showReceiptNumber',
        label: intl.get('receipt_no_'),
      },
      {
        labelKey: 'receiptDateLabel',
        enableKey: 'showReceiptDate',
        label: intl.get('receipt_date'),
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
  {
    label: intl.get('statements'),
    fields: [
      {
        enableKey: 'showCustomerNote',
        labelKey: 'customerNoteLabel',
        label: intl.get('customer_note'),
      },
      {
        enableKey: 'showTermsConditions',
        labelKey: 'termsConditionsLabel',
        label: intl.get('terms_conditions'),
      },
    ],
  },
];
