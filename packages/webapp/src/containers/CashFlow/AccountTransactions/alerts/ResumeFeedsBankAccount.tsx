import intl from 'react-intl-universal';
import { Intent, Alert } from '@blueprintjs/core';
import React from 'react';
import type { WithAlertActionsProps } from '@/containers/Alert/withAlertActions';
import type { WithAlertStoreConnectProps } from '@/containers/Alert/withAlertStoreConnect';
import { AppToaster } from '@/components';
import { withAlertActions } from '@/containers/Alert/withAlertActions';
import { withAlertStoreConnect } from '@/containers/Alert/withAlertStoreConnect';
import { useResumeFeedsBankAccount } from '@/hooks/query/banking';
import { compose } from '@/utils';

interface ResumeFeedsBankAccountAlertProps
  extends Pick<WithAlertActionsProps, 'closeAlert'>,
    WithAlertStoreConnectProps {
  name: string;
}

/**
 * Resume bank account feeds alert.
 */
function ResumeFeedsBankAccountAlert({
  name,

  // #withAlertStoreConnect
  isOpen,
  payload,

  // #withAlertActions
  closeAlert,
}: ResumeFeedsBankAccountAlertProps) {
  const { mutateAsync: resumeFeedsBankAccount, isPending: isLoading } =
    useResumeFeedsBankAccount();

  const bankAccountId = payload?.bankAccountId as number;

  // Handle activate item alert cancel.
  const handleCancelActivateItem = () => {
    closeAlert(name);
  };

  // Handle confirm item activated.
  const handleConfirmItemActivate = () => {
    resumeFeedsBankAccount({ bankAccountId })
      .then(() => {
        AppToaster.show({
          message: intl.get(
            'the_bank_feeds_of_the_bank_account_has_been_resumed',
          ),
          intent: Intent.SUCCESS,
        });
      })
      .catch(() => {})
      .finally(() => {
        closeAlert(name);
      });
  };

  return (
    <Alert
      cancelButtonText={intl.get('cancel')}
      confirmButtonText={intl.get('resume_bank_feeds')}
      intent={Intent.SUCCESS}
      isOpen={isOpen}
      onCancel={handleCancelActivateItem}
      loading={isLoading}
      onConfirm={handleConfirmItemActivate}
    >
      <p>
        {intl.get(
          'are_you_sure_want_to_resume_bank_feeds_syncing_of_this_bank_',
        )}
      </p>
    </Alert>
  );
}

export const ResumeFeedsBankAccount = compose(
  withAlertStoreConnect(),
  withAlertActions,
)(ResumeFeedsBankAccountAlert);
