import intl from 'react-intl-universal';
import { Intent, Alert } from '@blueprintjs/core';
import React from 'react';
import { withBankingActions } from '../../withBankingActions';
import type { WithBankingActionsProps } from '../../withBankingActions';
import type { WithAlertActionsProps } from '@/containers/Alert/withAlertActions';
import type { WithAlertStoreConnectProps } from '@/containers/Alert/withAlertStoreConnect';
import { AppToaster } from '@/components';
import { withAlertActions } from '@/containers/Alert/withAlertActions';
import { withAlertStoreConnect } from '@/containers/Alert/withAlertStoreConnect';
import { useUncategorizeTransactionsBulkAction } from '@/hooks/query/banking';
import { compose } from '@/utils';

interface UncategorizeBankTransactionsBulkAlertProps
  extends Pick<WithAlertActionsProps, 'closeAlert'>,
    Pick<WithBankingActionsProps, 'resetCategorizedTransactionsSelected'>,
    WithAlertStoreConnectProps {
  name: string;
}

/**
 * Uncategorize bank account transactions in build alert.
 */
function UncategorizeBankTransactionsBulkAlertInner({
  name,

  // #withAlertStoreConnect
  isOpen,
  payload,

  // #withAlertActions
  closeAlert,

  // #withBankingActions
  resetCategorizedTransactionsSelected,
}: UncategorizeBankTransactionsBulkAlertProps) {
  const { mutateAsync: uncategorizeTransactions, isPending: isLoading } =
    useUncategorizeTransactionsBulkAction();

  const uncategorizeTransactionsIds = (payload?.uncategorizeTransactionsIds ??
    []) as number[];

  // Handle activate item alert cancel.
  const handleCancelActivateItem = () => {
    closeAlert(name);
  };

  // Handle confirm item activated.
  const handleConfirmItemActivate = () => {
    uncategorizeTransactions({ ids: uncategorizeTransactionsIds })
      .then(() => {
        AppToaster.show({
          message: intl.get(
            'the_selected_transactions_have_been_uncategorized',
          ),
          intent: Intent.SUCCESS,
        });
        resetCategorizedTransactionsSelected();
      })
      .catch(() => {
        AppToaster.show({
          message: intl.get(
            'something_went_wrong_while_uncategorizing_transactions',
          ),
          intent: Intent.DANGER,
        });
      })
      .finally(() => {
        closeAlert(name);
      });
  };

  return (
    <Alert
      cancelButtonText={intl.get('cancel')}
      confirmButtonText={intl.get('uncategorize_transactions')}
      intent={Intent.DANGER}
      isOpen={isOpen}
      onCancel={handleCancelActivateItem}
      loading={isLoading}
      onConfirm={handleConfirmItemActivate}
    >
      <p>
        {intl.get(
          'are_you_sure_want_to_uncategorize_the_selected_bank_transact',
        )}
      </p>
    </Alert>
  );
}

export const UncategorizeBankTransactionsBulkAlert = compose(
  withAlertStoreConnect(),
  withAlertActions,
  withBankingActions,
)(UncategorizeBankTransactionsBulkAlertInner);
