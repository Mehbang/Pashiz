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

  // Top details.
  showEstimateNumber: true,
  estimateNumberLabel: intl.get('estimate_number'),

  estimateDateLabel: intl.get('date_of_issue'),
  showEstimateDate: true,

  showExpirationDate: true,
  expirationDateLabel: intl.get('expiration_date'),

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

  // Totals
  showSubtotal: true,
  subtotalLabel: intl.get('subtotal'),

  showTotal: true,
  totalLabel: intl.get('total'),

  // Statements
  showCustomerNote: true,
  customerNoteLabel: intl.get('customer_note'),

  // Terms & Conditions
  showTermsConditions: true,
  termsConditionsLabel: intl.get('terms_conditions'),
};

export const fieldsGroups = [
  {
    label: intl.get('header'),
    fields: [
      {
        labelKey: 'estimateNumberLabel',
        enableKey: 'showEstimateNumber',
        label: intl.get('estimate_no'),
      },
      {
        labelKey: 'estimateDateLabel',
        enableKey: 'showEstimateDate',
        label: intl.get('issue_date'),
      },
      {
        labelKey: 'expirationDateLabel',
        enableKey: 'showExpirationDate',
        label: intl.get('expiration_date'),
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
    label: intl.get('footer'),
    fields: [
      {
        labelKey: 'termsConditionsLabel',
        enableKey: 'showTermsConditions',
        label: intl.get('terms_conditions'),
      },
      {
        labelKey: 'customerNoteLabel',
        enableKey: 'showCustomerNote',
        label: intl.get('statement'),
        labelPlaceholder: intl.get('statement'),
      },
    ],
  },
];
