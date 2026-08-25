import intl from 'react-intl-universal';
export const MANAGE_LINK_URL = '/preferences/payment-methods';

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
  showInvoiceNumber: true,
  invoiceNumberLabel: intl.get('invoice_no_'),

  // Issue date
  showDateIssue: true,
  dateIssueLabel: intl.get('date_of_issue'),

  // Due date.
  showDueDate: true,
  dueDateLabel: intl.get('due_date'),

  // Addresses
  showCustomerAddress: true,
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

  // Discount
  showDiscount: true,
  discountLabel: intl.get('discount_2'),

  showTaxes: true,

  showTotal: true,
  totalLabel: intl.get('total'),

  paymentMadeLabel: intl.get('payment_made'),
  showPaymentMade: true,

  // Due amount
  dueAmountLabel: intl.get('due_amount'),
  showDueAmount: true,

  // Footer paragraphs.
  termsConditionsLabel: intl.get('terms_conditions'),
  showTermsConditions: true,

  // Statement
  statementLabel: intl.get('statement'),
  showStatement: true,
};

export const fieldsGroups = [
  {
    label: intl.get('header'),
    fields: [
      {
        labelKey: 'invoiceNumberLabel',
        enableKey: 'showInvoiceNumber',
        label: intl.get('invoice_no_2'),
      },
      {
        labelKey: 'dateIssueLabel',
        enableKey: 'showDateIssue',
        label: intl.get('issue_date'),
      },
      {
        labelKey: 'dueDateLabel',
        enableKey: 'showDueDate',
        label: intl.get('due_date'),
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
        labelKey: 'discountLabel',
        enableKey: 'showDiscount',
        label: intl.get('discount_2'),
      },
      { enableKey: 'showTaxes', label: intl.get('taxes') },
      {
        labelKey: 'totalLabel',
        enableKey: 'showTotal',
        label: intl.get('total'),
      },
      {
        labelKey: 'paymentMadeLabel',
        enableKey: 'showPaymentMade',
        label: intl.get('payment_made'),
      },
      {
        labelKey: 'dueAmountLabel',
        enableKey: 'showDueAmount',
        label: intl.get('due_amount'),
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
        labelKey: 'statementLabel',
        enableKey: 'showStatement',
        label: intl.get('statement'),
        labelPlaceholder: intl.get('statement'),
      },
    ],
  },
];
