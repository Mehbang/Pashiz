import intl from 'react-intl-universal';
import classNames from 'classnames';
import React, { lazy } from 'react';
import { Dialog, DialogSuspense } from '@/components';
import withDialogRedux from '@/components/DialogReduxConnect';
import { CLASSES } from '@/constants/classes';
import { compose } from '@/utils';

// Lazy loading the content.
const BalanceSheetPdfDialogContent = lazy(() =>
  import('./BalanceSheetPdfDialogContent').then((m) => ({
    default: m.BalanceSheetPdfDialogContent,
  })),
);

/**
 * Balance sheet pdf preview dialog.
 * @returns {React.ReactNode}
 */
interface BalanceSheetPdfDialogRootProps {
  dialogName: string;
  payload?: Record<string, unknown>;
  isOpen: boolean;
}

function BalanceSheetPdfDialogRoot({
  dialogName,
  isOpen,
}: BalanceSheetPdfDialogRootProps) {
  return (
    <Dialog
      name={dialogName}
      title={intl.get('balance_sheet_print_preview')}
      className={classNames(CLASSES.DIALOG_PDF_PREVIEW)}
      autoFocus={true}
      canEscapeKeyClose={true}
      isOpen={isOpen}
      style={{ width: '1000px' }}
    >
      <DialogSuspense>
        <BalanceSheetPdfDialogContent />
      </DialogSuspense>
    </Dialog>
  );
}

export const BalanceSheetPdfDialog = compose(withDialogRedux())(
  BalanceSheetPdfDialogRoot,
);
