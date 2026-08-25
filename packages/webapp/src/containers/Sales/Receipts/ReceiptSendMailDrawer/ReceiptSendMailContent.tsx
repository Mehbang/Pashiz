import intl from 'react-intl-universal';
import { Classes } from '@blueprintjs/core';
import { SendMailViewHeader } from '../../Estimates/SendMailViewDrawer/SendMailViewHeader';
import { SendMailViewLayout } from '../../Estimates/SendMailViewDrawer/SendMailViewLayout';
import { ReceiptSendMailBoot } from './ReceiptSendMailBoot';
import { ReceiptSendMailForm } from './ReceiptSendMailForm';
import { ReceiptSendMailFormFields } from './ReceiptSendMailFormFields';
import { ReceiptSendMailPreviewTabs } from './ReceiptSendMailPreviewTabs';
import { Stack } from '@/components';

export function ReceiptSendMailContent() {
  return (
    <Stack className={Classes.DRAWER_BODY}>
      <ReceiptSendMailBoot>
        <ReceiptSendMailForm>
          <SendMailViewLayout
            header={
              <SendMailViewHeader label={intl.get('send_receipt_mail')} />
            }
            fields={<ReceiptSendMailFormFields />}
            preview={<ReceiptSendMailPreviewTabs />}
          />
        </ReceiptSendMailForm>
      </ReceiptSendMailBoot>
    </Stack>
  );
}
