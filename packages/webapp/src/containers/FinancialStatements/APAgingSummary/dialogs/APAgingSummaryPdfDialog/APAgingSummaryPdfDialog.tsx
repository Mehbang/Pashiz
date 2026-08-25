import intl from 'react-intl-universal';
import classNames from 'classnames';
import React, { lazy } from 'react';
import { Dialog, DialogSuspense } from '@/components';
import withDialogRedux from '@/components/DialogReduxConnect';
import { CLASSES } from '@/constants/classes';
import { compose } from '@/utils';

const APAgingSummaryPdfDialogContent = lazy(() =>
  import('./APAgingSummaryPdfDialogContent').then((m) => ({
    default: m.APAgingSummaryPdfDialogContent,
  })),
);

interface APAgingSummaryPdfDialogRootProps {
  dialogName: string;
  payload?: Record<string, unknown>;
  isOpen: boolean;
}

function APAgingSummaryPdfDialogRoot({
  dialogName,
  isOpen,
}: APAgingSummaryPdfDialogRootProps) {
  return (
    <Dialog
      name={dialogName}
      title={intl.get('a_p_aging_summary_print_preview')}
      className={classNames(CLASSES.DIALOG_PDF_PREVIEW)}
      autoFocus={true}
      canEscapeKeyClose={true}
      isOpen={isOpen}
      style={{ width: '1000px' }}
    >
      <DialogSuspense>
        <APAgingSummaryPdfDialogContent />
      </DialogSuspense>
    </Dialog>
  );
}

export const APAgingSummaryPdfDialog = compose(withDialogRedux())(
  APAgingSummaryPdfDialogRoot,
);
