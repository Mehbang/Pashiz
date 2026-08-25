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

  // Address
  showCustomerAddress: true,
  showCompanyAddress: true,
  billedToLabel: intl.get('billed_to'),

  // Entries
  itemNameLabel: intl.get('item'),
  itemDescriptionLabel: intl.get('description'),
  itemRateLabel: intl.get('rate'),
  itemTotalLabel: intl.get('total'),

  // Total
  showTotal: true,
  totalLabel: intl.get('total'),

  // Subtotal
  showSubtotal: true,
  subtotalLabel: intl.get('subtotal'),

  // Customer Note.
  showCustomerNote: true,
  customerNoteLabel: intl.get('customer_note'),

  // Terms & Conditions
  showTermsConditions: true,
  termsConditionsLabel: intl.get('terms_conditions'),

  // Date issue.
  creditNoteDateLabel: intl.get('issue_of_date'),
  showCreditNoteDate: true,

  // Credit Number.
  creditNoteNumberLabel: intl.get('credit_note'),
  showCreditNoteNumber: true,
};

export const fieldsGroups = [
  {
    label: intl.get('header'),
    fields: [
      {
        labelKey: 'creditNoteDateLabel',
        enableKey: 'showCreditNoteDate',
        label: intl.get('issue_of_date'),
      },
      {
        labelKey: 'creditNoteNumberLabel',
        enableKey: 'showCreditNoteNumber',
        label: intl.get('credit_note'),
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
        label: intl.get('customer_note'),
        labelPlaceholder: intl.get('customer_note'),
      },
    ],
  },
];
