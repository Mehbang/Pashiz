// @ts-nocheck
import intl from 'react-intl-universal';
import { Intent, Alert } from '@blueprintjs/core';
import * as R from 'ramda';
import React from 'react';
import { AppToaster, FormattedMessage as T } from '@/components';
import { withAlertActions } from '@/containers/Alert/withAlertActions';
import { withAlertStoreConnect } from '@/containers/Alert/withAlertStoreConnect';
import { useCancelMainSubscription } from '@/hooks/query/subscription';

/**
 * Cancel Unlocking partial transactions alerts.
 */
function CancelMainSubscriptionAlertInner({
  name,

  // #withAlertStoreConnect
  isOpen,
  payload: { module },

  // #withAlertActions
  closeAlert,
}) {
  const { mutateAsync: cancelSubscription, isLoading } =
    useCancelMainSubscription();

  // Handle cancel.
  const handleCancel = () => {
    closeAlert(name);
  };
  // Handle confirm.
  const handleConfirm = () => {
    const values = {
      module: module,
    };
    cancelSubscription()
      .then(() => {
        AppToaster.show({
          message: intl.get('the_subscription_has_been_canceled'),
          intent: Intent.SUCCESS,
        });
      })
      .catch(({ data: { errors } }) => {})
      .finally(() => {
        closeAlert(name);
      });
  };

  return (
    <Alert
      cancelButtonText={<T id={'cancel'} />}
      confirmButtonText={intl.get('cancel_subscription')}
      intent={Intent.DANGER}
      isOpen={isOpen}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      loading={isLoading}
    >
      <p>
        <strong>
          {intl.get('the_subscription_for_this_organization_will_end')}
        </strong>
      </p>

      <p>
        {intl.get(
          'it_will_no_longer_be_accessible_to_you_or_any_other_users_ma',
        )}
      </p>
    </Alert>
  );
}

export const CancelMainSubscriptionAlert = R.compose(
  withAlertStoreConnect(),
  withAlertActions,
)(CancelMainSubscriptionAlertInner);
