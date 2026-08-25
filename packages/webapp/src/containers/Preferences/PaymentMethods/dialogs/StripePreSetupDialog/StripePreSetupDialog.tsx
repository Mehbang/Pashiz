import intl from 'react-intl-universal';
import React from 'react';
import { StripePreSetupDialogContent } from './StripePreSetupDialogContent';
import { Dialog, DialogSuspense } from '@/components';
import withDialogRedux, {
  type DialogBaseProps,
} from '@/components/DialogReduxConnect';
import { compose } from '@/utils';

interface StripePreSetupDialogRootProps {
  dialogName: string;
}

type StripePreSetupDialogRootConnectedProps = StripePreSetupDialogRootProps &
  DialogBaseProps;

/**
 * Select payment methods dialogs.
 */
function StripePreSetupDialogRoot({
  dialogName,
  payload,
  isOpen,
}: StripePreSetupDialogRootConnectedProps) {
  return (
    <Dialog
      name={dialogName}
      isOpen={isOpen}
      payload={payload}
      title={intl.get('connect_a_stripe_account_to_accept_card_payments')}
      canEscapeJeyClose={true}
      autoFocus={true}
      style={{ width: 500 }}
    >
      <DialogSuspense>
        <StripePreSetupDialogContent />
      </DialogSuspense>
    </Dialog>
  );
}

export const StripePreSetupDialog = compose(withDialogRedux())(
  StripePreSetupDialogRoot,
);

StripePreSetupDialogRoot.displayName = 'StripePreSetupDialog';
