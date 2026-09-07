import { InvoicePaymentPage, PaymentPageProps } from './PaymentPage';
import intl from 'react-intl-universal';

export interface InvoicePaymentPagePreviewProps
  extends Partial<PaymentPageProps> {}

export function InvoicePaymentPagePreview(
  props: InvoicePaymentPagePreviewProps,
) {
  return (
    <InvoicePaymentPage
      paidAmount={'$1,000.00'}
      dueDate={'20 Sep 2024'}
      total={'$1,000.00'}
      subtotal={'$1,000.00'}
      dueAmount={'$1,000.00'}
      customerName={intl.get('payment_page.sample_customer')}
      organizationName={intl.get('payment_page.sample_organization')}
      invoiceNumber={'INV-000001'}
      companyLogoUri={' '}
      organizationAddress={' '}
      {...props}
    />
  );
}
