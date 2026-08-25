// @ts-nocheck
import intl from 'react-intl-universal';
import { Intent, Alert } from '@blueprintjs/core';
import * as R from 'ramda';
import React from 'react';
import { AppToaster, FormattedMessage as T } from '@/components';
import { withAlertActions } from '@/containers/Alert/withAlertActions';
import { withAlertStoreConnect } from '@/containers/Alert/withAlertStoreConnect';
import { useResumeMainSubscription } from '@/hooks/query/subscription';

/**
 * Resume Unlocking partial transactions alerts.
 */
function ResumeMainSubscriptionAlertInner({
  name,

  // #withAlertStoreConnect
  isOpen,
  payload: { module },

  // #withAlertActions
  closeAlert,
}) {
  const { mutateAsync: resumeSubscription, isLoading } =
    useResumeMainSubscription();

  // Handle cancel.
  const handleCancel = () => {
    closeAlert(name);
  };
  // Handle confirm.
  const handleConfirm = () => {
    const values = {
      module: module,
    };
    resumeSubscription()
      .then(() => {
        AppToaster.show({
          message: intl.get('the_subscription_has_been_resumed'),
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
      confirmButtonText={intl.get('resume_subscription')}
      intent={Intent.DANGER}
      isOpen={isOpen}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      loading={isLoading}
    >
      <p>
        <strong>
          {intl.get('the_subscription_for_this_organization_will_resume')}
        </strong>

        <p>
          {intl.get(
            'are_you_sure_want_to_resume_the_subscription_of_this_organiz',
          )}
        </p>
      </p>
    </Alert>
  );
}

export const ResumeMainSubscriptionAlert = R.compose(
  withAlertStoreConnect(),
  withAlertActions,
)(ResumeMainSubscriptionAlertInner);
