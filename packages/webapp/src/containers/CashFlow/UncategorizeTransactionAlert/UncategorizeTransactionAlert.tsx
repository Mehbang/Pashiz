import intl from 'react-intl-universal';
import { Intent, Alert } from '@blueprintjs/core';
import React from 'react';
import type { WithAlertActionsProps } from '@/containers/Alert/withAlertActions';
import type { WithAlertStoreConnectProps } from '@/containers/Alert/withAlertStoreConnect';
import type { WithDrawerActionsProps } from '@/containers/Drawer/withDrawerActions';
import { AppToaster } from '@/components';
import { DRAWERS } from '@/constants/drawers';
import { withAlertActions } from '@/containers/Alert/withAlertActions';
import { withAlertStoreConnect } from '@/containers/Alert/withAlertStoreConnect';
import { withDrawerActions } from '@/containers/Drawer/withDrawerActions';
import { useUncategorizeTransaction } from '@/hooks/query';
import { compose } from '@/utils';

interface UncategorizeTransactionAlertProps
  extends Pick<WithAlertActionsProps, 'closeAlert'>,
    Pick<WithDrawerActionsProps, 'closeDrawer'>,
    WithAlertStoreConnectProps {
  name: string;
}

/**
 * Project delete alert.
 */
function UncategorizeTransactionAlertInner({
  name,

  // #withAlertStoreConnect
  isOpen,
  payload,

  // #withAlertActions
  closeAlert,

  // #withDrawerActions
  closeDrawer,
}: UncategorizeTransactionAlertProps) {
  const { mutateAsync: uncategorizeTransaction, isPending: isLoading } =
    useUncategorizeTransaction();

  const uncategorizedTransactionId =
    payload?.uncategorizedTransactionId as number;

  // handle cancel delete project alert.
  const handleCancelDeleteAlert = () => {
    closeAlert(name);
  };

  // handleConfirm delete project
  const handleConfirmBtnClick = () => {
    uncategorizeTransaction(uncategorizedTransactionId)
      .then(() => {
        AppToaster.show({
          message: intl.get('the_transaction_has_uncategorized_successfully'),
          intent: Intent.SUCCESS,
        });
        closeAlert(name);
        closeDrawer(DRAWERS.CASHFLOW_TRNASACTION_DETAILS);
      })
      .catch(() => {
        AppToaster.show({
          message: intl.get('something_wentwrong'),
          intent: Intent.DANGER,
        });
      });
  };

  return (
    <Alert
      cancelButtonText={intl.get('cancel')}
      confirmButtonText={intl.get('uncategorize')}
      intent={Intent.WARNING}
      isOpen={isOpen}
      onCancel={handleCancelDeleteAlert}
      onConfirm={handleConfirmBtnClick}
      loading={isLoading}
    >
      <p>Are you sure want to uncategorize the transaction?</p>
    </Alert>
  );
}

export const UncategorizeTransactionAlert = compose(
  withAlertStoreConnect(),
  withAlertActions,
  withDrawerActions,
)(UncategorizeTransactionAlertInner);
