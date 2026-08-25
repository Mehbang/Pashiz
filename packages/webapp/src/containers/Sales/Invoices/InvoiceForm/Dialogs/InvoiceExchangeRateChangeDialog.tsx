import intl from 'react-intl-universal';
import { Button, Classes, Intent } from '@blueprintjs/core';
import { Dialog, DialogSuspense } from '@/components';
import withDialogRedux from '@/components/DialogReduxConnect';
import { withDialogActions } from '@/containers/Dialog/withDialogActions';
import { compose } from '@/utils';

type InvoiceExchangeRateChangeDialogInnerProps = {
  dialogName: string;
  isOpen: boolean;
  closeDialog: (name: string) => void;
};

/**
 * Invoice number dialog.
 */
function InvoiceExchangeRateChangeDialogInner({
  dialogName,
  isOpen,
  // #withDialogActions
  closeDialog,
}: InvoiceExchangeRateChangeDialogInnerProps) {
  const handleConfirm = () => {
    closeDialog(dialogName);
  };

  return (
    <Dialog
      name={dialogName}
      title={intl.get('kindly_take_care_of_new_rates')}
      autoFocus={true}
      canEscapeKeyClose={true}
      isOpen={isOpen}
      onClose={() => {}}
    >
      <DialogSuspense>
        <div className={Classes.DIALOG_BODY}>
          <p>
            The item rates have been <strong>adjusted</strong> to the new
            currency using realtime exchange rate.
          </p>

          <p style={{ marginBottom: '30px' }}>
            {intl.get(
              'make_sure_to_check_that_the_item_rates_match_the_current_exc',
            )}
          </p>
        </div>

        <div className={Classes.DIALOG_FOOTER}>
          <Button onClick={handleConfirm} intent={Intent.PRIMARY} fill>
            Ok
          </Button>
        </div>
      </DialogSuspense>
    </Dialog>
  );
}

export const InvoiceExchangeRateChangeDialog = compose(
  withDialogRedux(),
  withDialogActions,
)(InvoiceExchangeRateChangeDialogInner);
