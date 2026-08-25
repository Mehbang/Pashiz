import intl from 'react-intl-universal';
import { Intent, Alert } from '@blueprintjs/core';
import React from 'react';
import { AppToaster, FormattedMessage as T } from '@/components';
import { withAlertActions } from '@/containers/Alert/withAlertActions';
import type { WithAlertActionsProps } from '@/containers/Alert/withAlertActions';
import { withAlertStoreConnect } from '@/containers/Alert/withAlertStoreConnect';
import type { WithAlertStoreConnectProps } from '@/containers/Alert/withAlertStoreConnect';
import { useDeletePaymentMethod } from '@/hooks/query/payment-services';
import { compose } from '@/utils';

interface DeleteStripeConnectionAlertProps {
  name: string;
}

type DeleteStripeConnectionAlertInnerProps = DeleteStripeConnectionAlertProps &
  WithAlertStoreConnectProps &
  Pick<WithAlertActionsProps, 'closeAlert'> & {
    payload: { paymentMethodId?: number | string };
  };

/**
 * Delete Stripe connection alert.
 */
function DeleteStripeAccountAlert({
  name,

  // #withAlertStoreConnect
  isOpen,
  payload: { paymentMethodId },

  // #withAlertActions
  closeAlert,
}: DeleteStripeConnectionAlertInnerProps) {
  const { isPending, mutateAsync: deletePaymentMethod } =
    useDeletePaymentMethod();

  // Handle cancel open bill alert.
  const handleCancelOpenBill = () => {
    closeAlert(name);
  };
  // Handle confirm bill open.
  const handleConfirmBillOpen = () => {
    deletePaymentMethod({ paymentMethodId: Number(paymentMethodId) })
      .then(() => {
        AppToaster.show({
          message: intl.get('the_stripe_payment_account_has_been_deleted'),
          intent: Intent.SUCCESS,
        });
        closeAlert(name);
      })
      .catch(() => {
        closeAlert(name);
        AppToaster.show({
          message: intl.get('something_wentwrong'),
          // Preserved latent bug: original code uses SUCCESS for an error toast.
          intent: Intent.SUCCESS,
        });
      });
  };

  return (
    <Alert
      // @ts-expect-error — BlueprintJS types cancelButtonText as string but
      // rendering a FormattedMessage element works at runtime.
      cancelButtonText={<T id={'cancel'} />}
      confirmButtonText={intl.get('delete_account')}
      intent={Intent.DANGER}
      isOpen={isOpen}
      onCancel={handleCancelOpenBill}
      onConfirm={handleConfirmBillOpen}
      loading={isPending}
    >
      <p>Are you sure want to delete your Stripe account connection?</p>
    </Alert>
  );
}

export const DeleteStripeConnectionAlert = compose(
  withAlertStoreConnect(),
  withAlertActions,
)(DeleteStripeAccountAlert);
