import intl from 'react-intl-universal';
import {
  PaperTemplate,
  PaperTemplateProps,
  PaperTemplateTotalBorder,
} from '../../Invoices/InvoiceCustomize/PaperTemplate';
import { Box, Group, Stack } from '@/components';
import {
  DefaultPdfTemplateAddressBilledFrom,
  DefaultPdfTemplateAddressBilledTo,
} from '@/constants/PdfTemplates';

export interface PaymentReceivedPaperTemplateProps extends PaperTemplateProps {
  // # Company logo
  showCompanyLogo?: boolean;
  companyLogoUri?: string;

  // # Company name
  companyName?: string;

  // Customer address
  showCustomerAddress?: boolean;
  customerAddress?: string;

  // Company address
  showCompanyAddress?: boolean;
  companyAddress?: string;

  billedToLabel?: string;

  // Total.
  total?: string;
  showTotal?: boolean;
  totalLabel?: string;

  // Subtotal.
  subtotal?: string;
  showSubtotal?: boolean;
  subtotalLabel?: string;

  lines?: Array<{
    paidAmount: string;
    invoiceAmount: string;
    invoiceNumber: string;
  }>;

  // Issue date.
  paymentReceivedDateLabel?: string;
  showPaymentReceivedDate?: boolean;
  paymentReceivedDate?: string;

  // Payment received number.
  paymentReceivedNumebr?: string;
  paymentReceivedNumberLabel?: string;
  showPaymentReceivedNumber?: boolean;
}

export function PaymentReceivedPaperTemplate({
  // # Colors
  primaryColor,
  secondaryColor,

  // # Company logo
  showCompanyLogo = true,
  companyLogoUri,

  // # Company name
  companyName = 'Bigcapital Technology, Inc.',

  // # Customer address
  showCustomerAddress = true,
  customerAddress = DefaultPdfTemplateAddressBilledTo,

  // # Company address
  showCompanyAddress = true,
  companyAddress = DefaultPdfTemplateAddressBilledFrom,

  billedToLabel = intl.get('billed_to'),

  total = '$1000.00',
  totalLabel = intl.get('total'),
  showTotal = true,

  subtotal = '1000/00',
  subtotalLabel = intl.get('subtotal'),
  showSubtotal = true,

  lines = [
    {
      invoiceNumber: 'INV-00001',
      invoiceAmount: '$1000.00',
      paidAmount: '$1000.00',
    },
  ],
  showPaymentReceivedNumber = true,
  paymentReceivedNumberLabel = intl.get('payment_no_'),
  paymentReceivedNumebr = '346D3D40-0001',

  paymentReceivedDate = 'September 3, 2024',
  showPaymentReceivedDate = true,
  paymentReceivedDateLabel = intl.get('payment_date'),
}: PaymentReceivedPaperTemplateProps) {
  return (
    <PaperTemplate primaryColor={primaryColor} secondaryColor={secondaryColor}>
      <Stack spacing={24}>
        <Group align={'start'} spacing={10}>
          <Stack flex={1}>
            <PaperTemplate.BigTitle title={intl.get('payment')} />

            <PaperTemplate.TermsList>
              {showPaymentReceivedNumber && (
                <PaperTemplate.TermsItem label={paymentReceivedNumberLabel}>
                  {paymentReceivedNumebr}
                </PaperTemplate.TermsItem>
              )}

              {showPaymentReceivedDate && (
                <PaperTemplate.TermsItem label={paymentReceivedDateLabel}>
                  {paymentReceivedDate}
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
              { label: intl.get('invoice_no'), accessor: 'invoiceNumber' },
              {
                label: intl.get('invoice_amount'),
                accessor: 'invoiceAmount',
                align: 'right',
              },
              {
                label: intl.get('paid_amount'),
                accessor: 'paidAmount',
                align: 'right',
              },
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
            {showTotal && (
              <PaperTemplate.TotalLine
                label={totalLabel}
                amount={total}
                border={PaperTemplateTotalBorder.Dark}
                style={{ fontWeight: 500 }}
              />
            )}
          </PaperTemplate.Totals>
        </Stack>
      </Stack>
    </PaperTemplate>
  );
}
