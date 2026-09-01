import { I18nService } from 'nestjs-i18n';

/**
 * Attribute name -> `pdf_template` namespace key, for every label a paper
 * template can show. The defaults these replace are written in English in the
 * per-resource `constants.ts`, which is what a Persian organization used to
 * print until this ran.
 */
const LABEL_KEYS: Record<string, string> = {
  dueDateLabel: 'due_date',
  dateIssueLabel: 'date_issue',
  invoiceNumberLabel: 'invoice_number',
  billedToLabel: 'billed_to',
  lineItemLabel: 'line_item',
  lineQuantityLabel: 'line_quantity',
  lineSecondaryQuantityLabel: 'line_secondary_quantity',
  lineRateLabel: 'line_rate',
  lineTotalLabel: 'line_total',
  lineDiscountLabel: 'discount',
  adjustmentLabel: 'adjustment',
  totalLabel: 'total',
  subtotalLabel: 'subtotal',
  discountLabel: 'discount',
  paymentMadeLabel: 'payment_made',
  balanceDueLabel: 'balance_due',
  dueAmountLabel: 'balance_due',
  termsConditionsLabel: 'terms_conditions',
  statementLabel: 'statement',
  customerNoteLabel: 'customer_note',
  estimateNumberLabel: 'estimate_number',
  estimateDateLabel: 'estimate_date',
  expirationDateLabel: 'expiration_date',
  receiptNumberLabel: 'receipt_number',
  receiptDateLabel: 'receipt_date',
  creditNoteNumberLabel: 'credit_note_number',
  creditNoteDateLabel: 'credit_note_date',
  paymentReceivedNumberLabel: 'payment_received_number',
  paymentReceivedDateLabel: 'payment_received_date',
};

/**
 * Translates the `*Label` attributes of a paper template's default attributes
 * into the organization's language.
 *
 * Every label in the table above is filled in, not only the ones the resource
 * already declared: a label a paper template renders but the defaults omit
 * (`lineDiscountLabel`, `adjustmentLabel`, `dueAmountLabel`) would otherwise
 * fall back to the English default baked into the component. Labels a given
 * template never shows are inert extra props.
 *
 * Only the defaults are touched. A label the user typed into the template
 * editor is their own wording and is left exactly as saved.
 */
export function translateTemplateLabels<T extends Record<string, any>>(
  attributes: T,
  i18n: I18nService,
  lang?: string,
  { titleKey }: { titleKey?: string } = {},
): T {
  const translated = { ...attributes } as Record<string, any>;

  for (const [attribute, key] of Object.entries(LABEL_KEYS)) {
    translated[attribute] = i18n.t(`pdf_template.${key}`, { lang });
  }
  // The heading the document is printed under ("Invoice", "Estimate", ...),
  // which is the one label that differs per resource.
  if (titleKey) {
    translated.bigtitle = i18n.t(`pdf_template.${titleKey}`, { lang });
  }
  return translated as T;
}
