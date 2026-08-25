import intl from 'react-intl-universal';
import { Text, Classes, Button, Intent } from '@blueprintjs/core';
import { css } from '@emotion/css';
import clsx from 'classnames';
import styles from './PaymentPortal.module.scss';
import { usePaymentPortalBoot } from './PaymentPortalBoot';
import { AppToaster, Box, Group, Stack } from '@/components';
import { DRAWERS } from '@/constants/drawers';
import {
  useCreateStripeCheckoutSession,
  useGeneratePaymentLinkInvoicePdf,
} from '@/hooks/query/payment-link';
import { useDrawerActions } from '@/hooks/state';
import { downloadFile } from '@/hooks/useDownloadFile';

export function PaymentPortal() {
  const { openDrawer } = useDrawerActions();
  const { sharableLinkMeta, linkId } = usePaymentPortalBoot();
  const {
    mutateAsync: createStripeCheckoutSession,
    isPending: isStripeCheckoutLoading,
  } = useCreateStripeCheckoutSession();

  const {
    mutateAsync: generatePaymentLinkInvoice,
    isPending: isInvoiceGenerating,
  } = useGeneratePaymentLinkInvoicePdf();

  // Handles invoice preview button click.
  const handleInvoicePreviewBtnClick = () => {
    openDrawer(DRAWERS.PAYMENT_INVOICE_PREVIEW);
  };

  // Handles invoice download button click.
  const handleInvoiceDownloadBtnClick = () => {
    generatePaymentLinkInvoice({ paymentLinkId: linkId })
      .then((data) => {
        downloadFile(
          data,
          `Invoice ${sharableLinkMeta?.invoiceNo}`,
          'application/pdf',
        );
      })
      .catch(() => {
        AppToaster.show({
          intent: Intent.DANGER,
          message: intl.get('something_wentwrong'),
        });
      });
  };

  // handles the pay button click.
  const handlePayButtonClick = () => {
    createStripeCheckoutSession({ linkId })
      .then((session) => {
        window.open(session.redirectTo);
      })
      .catch((error) => {
        AppToaster.show({
          intent: Intent.DANGER,
          message: intl.get('something_wentwrong'),
        });
      });
  };

  return (
    <Box className={styles.root} my={'40px'} mx={'auto'}>
      <Stack spacing={0} className={styles.body}>
        <Stack>
          <Group spacing={10}>
            {sharableLinkMeta?.brandingTemplate?.companyLogoUri && (
              <Box
                className={styles.companyLogoWrap}
                style={{
                  backgroundImage: `url(${sharableLinkMeta?.brandingTemplate?.companyLogoUri})`,
                }}
              ></Box>
            )}
            <Text>{sharableLinkMeta?.organization?.name}</Text>
          </Group>

          <Stack spacing={6}>
            <h1 className={styles.bigTitle}>
              {intl.get('payment_page.sent_an_invoice_for', {
                organization: sharableLinkMeta?.organization?.name,
                amount: sharableLinkMeta?.totalFormatted,
              })}
            </h1>
            <Group spacing={10}>
              <Text className={clsx(Classes.TEXT_MUTED, styles.invoiceDueDate)}>
                {intl.get('payment_page.invoice_due', {
                  date: sharableLinkMeta?.dueDateFormatted,
                })}
              </Text>
            </Group>
          </Stack>

          <Stack className={styles.address} spacing={2}>
            <Box className={styles.customerName}>
              {sharableLinkMeta?.customerName}
            </Box>

            {sharableLinkMeta?.formattedCustomerAddress && (
              <Box
                dangerouslySetInnerHTML={{
                  __html: sharableLinkMeta?.formattedCustomerAddress,
                }}
              />
            )}
          </Stack>

          <h2 className={styles.invoiceNumber}>
            {intl.get('payment_page.invoice_number', {
              number: sharableLinkMeta?.invoiceNo,
            })}
          </h2>

          <Stack spacing={0} className={styles.totals}>
            <Group
              position={'apart'}
              className={clsx(styles.totalItem, styles.borderBottomGray)}
            >
              <Text>{intl.get('sub_total')}</Text>
              <Text>{sharableLinkMeta?.subtotalFormatted}</Text>
            </Group>

            <Group position={'apart'} className={styles.totalItem}>
              <Text>{intl.get('total')}</Text>
              <Text style={{ fontWeight: 500 }}>
                {sharableLinkMeta?.totalFormatted}
              </Text>
            </Group>

            {sharableLinkMeta?.taxes?.map((tax, key) => (
              <Group key={key} position={'apart'} className={styles.totalItem}>
                <Text>{tax?.name}</Text>
                <Text>{tax?.taxRateAmountFormatted}</Text>
              </Group>
            ))}
            <Group
              position={'apart'}
              className={clsx(styles.totalItem, styles.borderBottomGray)}
            >
              <Text>{intl.get('paid_amount_2')}</Text>
              <Text>{sharableLinkMeta?.paymentAmountFormatted}</Text>
            </Group>

            <Group
              position={'apart'}
              className={clsx(styles.totalItem, styles.borderBottomDark)}
            >
              <Text>{intl.get('due_amount')}</Text>
              <Text style={{ fontWeight: 500 }}>
                {sharableLinkMeta?.dueAmountFormatted}
              </Text>
            </Group>
          </Stack>
        </Stack>

        <Stack spacing={8} className={styles.footerButtons}>
          <Button
            minimal
            className={clsx(styles.footerButton, styles.downloadInvoiceButton)}
            onClick={handleInvoiceDownloadBtnClick}
            loading={isInvoiceGenerating}
          >
            {intl.get('download_invoice')}
          </Button>

          <Button
            onClick={handleInvoicePreviewBtnClick}
            className={clsx(styles.footerButton, styles.viewInvoiceButton)}
          >
            {intl.get('view_invoice')}
          </Button>

          {sharableLinkMeta?.isReceivable &&
            sharableLinkMeta?.hasStripePaymentMethod && (
              <Button
                intent={Intent.PRIMARY}
                className={clsx(
                  styles.footerButton,
                  styles.buyButton,
                  css`
                    &.bp4-button.bp4-intent-primary {
                      background-color: var(--payment-page-primary-button);

                      &:hover,
                      &:focus {
                        background-color: var(
                          --payment-page-primary-button-hover
                        );
                      }
                    }
                  `,
                )}
                loading={isStripeCheckoutLoading}
                onClick={handlePayButtonClick}
              >
                Pay {sharableLinkMeta?.totalFormatted}
              </Button>
            )}
        </Stack>

        <Text className={clsx(Classes.TEXT_MUTED, styles.buyNote)}>
          {intl.get(
            'by_confirming_your_payment_you_allow_bigcapital_technology_i',
          )}
        </Text>
      </Stack>

      <Stack spacing={18} className={styles.footer}>
        <Box
          dangerouslySetInnerHTML={{
            __html: sharableLinkMeta?.organization?.addressTextFormatted || '',
          }}
        ></Box>

        <Stack spacing={0} className={styles.footerText}>
          © 2024 Bigcapital Technology, Inc.
          <br />
          {intl.get('all_rights_reserved_2')}
        </Stack>
      </Stack>
    </Box>
  );
}
