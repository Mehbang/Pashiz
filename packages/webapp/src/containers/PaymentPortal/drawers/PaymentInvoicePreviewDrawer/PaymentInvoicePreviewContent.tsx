// @ts-nocheck
import intl from 'react-intl-universal';
import { usePaymentPortalBoot } from '../../PaymentPortalBoot';
import { Box, DrawerBody, DrawerHeaderContent } from '@/components';
import { InvoicePaperTemplate } from '@/containers/Sales/Invoices/InvoiceCustomize/InvoicePaperTemplate';

export function PaymentInvoicePreviewContent() {
  const { sharableLinkMeta } = usePaymentPortalBoot();

  return (
    <>
      <DrawerHeaderContent title={intl.get('invoice')} />

      <DrawerBody>
        <Box style={{ paddingTop: 20, paddingBottom: 20 }}>
          <InvoicePaperTemplate
            invoiceNumber={sharableLinkMeta?.invoiceNo}
            dueDate={sharableLinkMeta?.dueDateFormatted}
            dateIssue={sharableLinkMeta?.invoiceDateFormatted}
            total={sharableLinkMeta?.totalFormatted}
            subtotal={sharableLinkMeta?.subtotalFormatted}
            balanceDue={sharableLinkMeta?.dueAmountFormatted}
            paymentMade={sharableLinkMeta?.paymentAmountFormatted}
            discount={sharableLinkMeta?.discountAmountFormatted}
            discountLabel={
              sharableLinkMeta?.discountPercentageFormatted
                ? `${intl.get('discount')} [${sharableLinkMeta.discountPercentageFormatted}]`
                : undefined
            }
            termsConditions={sharableLinkMeta?.termsConditions}
            statement={sharableLinkMeta?.invoiceMessage}
            companyName={sharableLinkMeta?.companyName}
            primaryColor={sharableLinkMeta?.brandingTemplate?.primaryColor}
            secondaryColor={sharableLinkMeta?.brandingTemplate?.secondaryColor}
            lines={sharableLinkMeta?.entries?.map((entry) => ({
              item: entry.itemName,
              description: entry.description,
              // The same two readings the printed copy carries, so the page a
              // customer opens agrees with the invoice they are sent.
              quantity: entry.quantityWithUnit || entry.quantityFormatted,
              secondaryQuantity: entry.secondaryQuantityWithUnit,
              rate: entry.rateFormatted,
              total: entry.totalFormatted,
            }))}
            taxes={sharableLinkMeta?.taxes?.map((tax) => ({
              label: tax.name,
              amount: tax.taxRateAmountFormatted,
            }))}
            companyAddress={
              sharableLinkMeta?.organization?.addressTextFormatted
            }
            customerAddress={sharableLinkMeta?.formattedCustomerAddress}
          />
        </Box>
      </DrawerBody>
    </>
  );
}
