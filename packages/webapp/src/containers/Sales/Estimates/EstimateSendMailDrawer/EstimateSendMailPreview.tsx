import intl from 'react-intl-universal';
import { Tab } from '@blueprintjs/core';
import { lazy } from 'react';
import { Suspense } from 'react';
import { SendMailViewPreviewTabs } from '../SendMailViewDrawer/SendMailViewPreviewTabs';

const EstimateSendPdfPreviewConnected = lazy(() =>
  import('./EstimateSendPdfPreviewConnected').then((module) => ({
    default: module.EstimateSendPdfPreviewConnected,
  })),
);
const EstimateSendMailReceiptPreview = lazy(() =>
  import('./EstimateSendMailReceiptPreview').then((module) => ({
    default: module.EstimateSendMailReceiptPreview,
  })),
);

export function EstimateSendMailPreviewTabs() {
  return (
    <SendMailViewPreviewTabs>
      <Tab
        id={'payment-page'}
        title={intl.get('payment_page')}
        panel={
          <Suspense>
            <EstimateSendMailReceiptPreview />
          </Suspense>
        }
      />
      <Tab
        id="pdf-document"
        title={intl.get('pdf_document')}
        panel={
          <Suspense>
            <EstimateSendPdfPreviewConnected />
          </Suspense>
        }
      />
    </SendMailViewPreviewTabs>
  );
}
