import intl from 'react-intl-universal';
import { Classes, Text } from '@blueprintjs/core';
import {
  PaperTemplate,
  PaperTemplateProps,
  PaperTemplateTotalBorder,
} from './PaperTemplate';
import { Box, Group, Stack } from '@/components';
import {
  DefaultPdfTemplateTerms,
  DefaultPdfTemplateItemDescription,
  DefaultPdfTemplateStatement,
  DefaultPdfTemplateItemName,
  DefaultPdfTemplateAddressBilledTo,
  DefaultPdfTemplateAddressBilledFrom,
} from '@/constants/PdfTemplates';

interface PapaerLine {
  item?: string;
  description?: string;
  quantity?: string;
  /** The same amount read in the item's second unit, already carrying it. */
  secondaryQuantity?: string;
  rate?: string;
  total?: string;
}

interface PaperTax {
  label: string;
  amount: string;
}

export interface InvoicePaperTemplateProps extends PaperTemplateProps {
  primaryColor?: string;
  secondaryColor?: string;

  showCompanyLogo?: boolean;
  companyLogoUri?: string;

  showInvoiceNumber?: boolean;
  invoiceNumber?: string;
  invoiceNumberLabel?: string;

  showDateIssue?: boolean;
  dateIssue?: string;
  dateIssueLabel?: string;

  showDueDate?: boolean;
  dueDate?: string;
  dueDateLabel?: string;

  companyName?: string;
  bigtitle?: string;

  // Address
  showCustomerAddress?: boolean;
  customerAddress?: string;

  showCompanyAddress?: boolean;
  companyAddress?: string;

  billedToLabel?: string;

  // Entries
  lineItemLabel?: string;
  lineQuantityLabel?: string;
  lineSecondaryQuantityLabel?: string;
  lineRateLabel?: string;
  lineTotalLabel?: string;

  // Totals
  showTotal?: boolean;
  totalLabel?: string;
  total?: string;

  showDiscount?: boolean;
  discountLabel?: string;
  discount?: string;

  showSubtotal?: boolean;
  subtotalLabel?: string;
  subtotal?: string;

  showPaymentMade?: boolean;
  paymentMadeLabel?: string;
  paymentMade?: string;

  showTaxes?: boolean;

  showDueAmount?: boolean;
  showBalanceDue?: boolean;
  balanceDueLabel?: string;
  balanceDue?: string;

  // Footer
  termsConditionsLabel?: string;
  showTermsConditions?: boolean;
  termsConditions?: string;

  statementLabel?: string;
  showStatement?: boolean;
  statement?: string;

  lines?: Array<PapaerLine>;
  taxes?: Array<PaperTax>;
}

export function InvoicePaperTemplate({
  primaryColor,
  secondaryColor,

  companyName = 'Bigcapital Technology, Inc.',

  showCompanyLogo = true,
  companyLogoUri = '',

  dueDate = 'September 3, 2024',
  dueDateLabel = intl.get('date_due'),
  showDueDate = true,

  dateIssue = 'September 3, 2024',
  dateIssueLabel = intl.get('date_of_issue'),
  showDateIssue = true,

  // dateIssue,
  invoiceNumberLabel = intl.get('invoice_no_'),
  invoiceNumber = '346D3D40-0001',
  showInvoiceNumber = true,

  // Address
  showCustomerAddress = true,
  customerAddress = DefaultPdfTemplateAddressBilledTo,

  showCompanyAddress = true,
  companyAddress = DefaultPdfTemplateAddressBilledFrom,

  billedToLabel = intl.get('billed_to'),

  // Entries
  lineItemLabel = intl.get('item'),
  lineQuantityLabel = intl.get('qty_2'),
  lineSecondaryQuantityLabel = intl.get('entries.secondary_unit_quantity'),
  lineRateLabel = intl.get('rate'),
  lineTotalLabel = intl.get('total'),

  totalLabel = intl.get('total'),
  subtotalLabel = intl.get('subtotal'),
  discountLabel = intl.get('discount_2'),
  paymentMadeLabel = intl.get('payment_made'),
  balanceDueLabel = intl.get('balance_due'),

  // Totals
  showTotal = true,
  showSubtotal = true,
  showDiscount = true,
  showTaxes = true,
  showPaymentMade = true,
  showDueAmount = true,
  showBalanceDue = true,

  total = '$662.75',
  subtotal = '630.00',
  discount = '0.00',
  paymentMade = '100.00',
  balanceDue = '$562.75',

  // Footer paragraphs.
  termsConditionsLabel = intl.get('terms_conditions'),
  showTermsConditions = true,
  termsConditions = DefaultPdfTemplateTerms,

  lines = [
    {
      item: DefaultPdfTemplateItemName,
      description: DefaultPdfTemplateItemDescription,
      rate: '1',
      quantity: '1000',
      total: '$1000.00',
    },
  ],
  taxes = [
    { label: intl.get('sample_tax1_4_70'), amount: '11.75' },
    { label: intl.get('sample_tax2_7_00'), amount: '21.74' },
  ],

  statementLabel = intl.get('statement'),
  showStatement = true,
  statement = DefaultPdfTemplateStatement,
  ...props
}: InvoicePaperTemplateProps) {
  return (
    <PaperTemplate
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      {...props}
    >
      <Stack spacing={24}>
        <Group align="start" spacing={10}>
          <Stack flex={1}>
            <PaperTemplate.BigTitle title={intl.get('invoice')} />

            <PaperTemplate.TermsList>
              {showInvoiceNumber && (
                <PaperTemplate.TermsItem label={invoiceNumberLabel}>
                  {invoiceNumber}
                </PaperTemplate.TermsItem>
              )}
              {showDateIssue && (
                <PaperTemplate.TermsItem label={dateIssueLabel}>
                  {dateIssue}
                </PaperTemplate.TermsItem>
              )}
              {showDueDate && (
                <PaperTemplate.TermsItem label={dueDateLabel}>
                  {dueDate}
                </PaperTemplate.TermsItem>
              )}
            </PaperTemplate.TermsList>
          </Stack>

          {companyLogoUri && showCompanyLogo && (
            <PaperTemplate.Logo logoUri={companyLogoUri} />
          )}
        </Group>

        <PaperTemplate.AddressesGroup>
          {showCompanyAddress && (
            <PaperTemplate.Address>
              <Box dangerouslySetInnerHTML={{ __html: companyAddress }} />
            </PaperTemplate.Address>
          )}
          {showCustomerAddress && (
            <PaperTemplate.Address>
              <strong>{billedToLabel}</strong>
              <Box dangerouslySetInnerHTML={{ __html: customerAddress }} />
            </PaperTemplate.Address>
          )}
        </PaperTemplate.AddressesGroup>

        <Stack spacing={0}>
          <PaperTemplate.Table
            columns={[
              {
                label: lineItemLabel,
                accessor: (data) => (
                  <Stack spacing={2}>
                    <Text>{data.item}</Text>
                    <Text
                      className={Classes.TEXT_MUTED}
                      style={{ fontSize: 12 }}
                    >
                      {data.description}
                    </Text>
                  </Stack>
                ),
              },
              { label: lineQuantityLabel, accessor: 'quantity' },
              {
                // On screen as in print. Hidden where no line on this document
                // has a second unit, rather than an empty column on every
                // invoice that does not use them.
                label: lineSecondaryQuantityLabel,
                accessor: 'secondaryQuantity',
                visible: (lines ?? []).some(
                  (line: { secondaryQuantity?: string }) =>
                    Boolean(line?.secondaryQuantity),
                ),
              },
              { label: lineRateLabel, accessor: 'rate', align: 'right' },
              { label: lineTotalLabel, accessor: 'total', align: 'right' },
            ]}
            data={lines}
          />
          <PaperTemplate.Totals>
            {showSubtotal && (
              <PaperTemplate.TotalLine
                label={subtotalLabel}
                amount={subtotal}
                border={PaperTemplateTotalBorder.Gray}
              />
            )}
            {showDiscount && (
              <PaperTemplate.TotalLine
                label={discountLabel}
                amount={discount}
              />
            )}
            {showTaxes && (
              <>
                {taxes.map((tax, index) => (
                  <PaperTemplate.TotalLine
                    key={index}
                    label={tax.label}
                    amount={tax.amount}
                  />
                ))}
              </>
            )}
            {showTotal && (
              <PaperTemplate.TotalLine
                label={totalLabel}
                amount={total}
                border={PaperTemplateTotalBorder.Dark}
                style={{ fontWeight: 500 }}
              />
            )}
            {showPaymentMade && (
              <PaperTemplate.TotalLine
                label={paymentMadeLabel}
                amount={paymentMade}
              />
            )}
            {showBalanceDue && (
              <PaperTemplate.TotalLine
                label={balanceDueLabel}
                amount={balanceDue}
                border={PaperTemplateTotalBorder.Dark}
                style={{ fontWeight: 500 }}
              />
            )}
          </PaperTemplate.Totals>
        </Stack>

        <Stack spacing={0}>
          {showTermsConditions && termsConditions && (
            <PaperTemplate.Statement label={termsConditionsLabel}>
              {termsConditions}
            </PaperTemplate.Statement>
          )}

          {showStatement && statement && (
            <PaperTemplate.Statement label={statementLabel}>
              {statement}
            </PaperTemplate.Statement>
          )}
        </Stack>
      </Stack>
    </PaperTemplate>
  );
}
