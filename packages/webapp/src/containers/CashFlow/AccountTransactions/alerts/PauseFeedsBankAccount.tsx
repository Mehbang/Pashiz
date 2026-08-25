import intl from 'react-intl-universal';
import { Intent, Alert } from '@blueprintjs/core';
import React from 'react';
import type { WithAlertActionsProps } from '@/containers/Alert/withAlertActions';
import type { WithAlertStoreConnectProps } from '@/containers/Alert/withAlertStoreConnect';
import { AppToaster } from '@/components';
import { withAlertActions } from '@/containers/Alert/withAlertActions';
import { withAlertStoreConnect } from '@/containers/Alert/withAlertStoreConnect';
import { usePauseFeedsBankAccount } from '@/hooks/query/banking';
import { compose } from '@/utils';

interface PauseFeedsBankAccountAlertProps
  extends Pick<WithAlertActionsProps, 'closeAlert'>,
    WithAlertStoreConnectProps {
  name: string;
}

/**
 * Pause feeds of the bank account alert.
 */
function PauseFeedsBankAccountAlert({
  name,

  // #withAlertStoreConnect
  isOpen,
  payload,

  // #withAlertActions
  closeAlert,
}: PauseFeedsBankAccountAlertProps) {
  const { mutateAsync: pauseBankAccountFeeds, isPending: isLoading } =
    usePauseFeedsBankAccount();

  const bankAccountId = payload?.bankAccountId as number;

  // Handle activate item alert cancel.
  const handleCancelActivateItem = () => {
    closeAlert(name);
  };
  // Handle confirm item activated.
  const handleConfirmItemActivate = () => {
    pauseBankAccountFeeds({ bankAccountId })
      .then(() => {
        AppToaster.show({
          message: intl.get(
            'the_bank_feeds_of_the_bank_account_has_been_paused',
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
      confirmButtonText={intl.get('pause_bank_feeds')}
      intent={Intent.WARNING}
      isOpen={isOpen}
      onCancel={handleCancelActivateItem}
      loading={isLoading}
      onConfirm={handleConfirmItemActivate}
    >
      <p>
        {intl.get(
          'are_you_sure_want_to_pause_bank_feeds_syncing_of_this_bank_a',
        )}
      </p>
    </Alert>
  );
}

export const PauseFeedsBankAccount = compose(
  withAlertStoreConnect(),
  withAlertActions,
)(PauseFeedsBankAccountAlert);
