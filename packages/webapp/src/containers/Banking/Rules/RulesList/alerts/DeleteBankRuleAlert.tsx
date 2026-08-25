// @ts-nocheck
import intl from 'react-intl-universal';
import { Intent, Alert } from '@blueprintjs/core';
import React from 'react';
import { FormattedMessage as T } from '@/components';
import { AppToaster } from '@/components';
import { withAlertActions } from '@/containers/Alert/withAlertActions';
import { withAlertStoreConnect } from '@/containers/Alert/withAlertStoreConnect';
import { withDrawerActions } from '@/containers/Drawer/withDrawerActions';
import { useDeleteBankRule } from '@/hooks/query/banking';
import { compose } from '@/utils';

/**
 * Project delete alert.
 */
function BankRuleDeleteAlert({
  name,

  // #withAlertStoreConnect
  isOpen,
  payload: { id },

  // #withAlertActions
  closeAlert,

  // #withDrawerActions
  closeDrawer,
}) {
  const { mutateAsync: deleteBankRule, isLoading } = useDeleteBankRule();

  // handle cancel delete project alert.
  const handleCancelDeleteAlert = () => {
    closeAlert(name);
  };

  // handleConfirm delete project
  const handleConfirmBtnClick = () => {
    deleteBankRule(id)
      .then(() => {
        AppToaster.show({
          message: intl.get('the_bank_rule_has_deleted_successfully'),
          intent: Intent.SUCCESS,
        });
        closeAlert(name);
      })
      .catch(({ data: { errors } }) => {
        AppToaster.show({
          message: intl.get('something_wentwrong'),
          intent: Intent.DANGER,
        });
      });
  };

  return (
    <Alert
      cancelButtonText={<T id={'cancel'} />}
      confirmButtonText={intl.get('delete')}
      intent={Intent.DANGER}
      isOpen={isOpen}
      onCancel={handleCancelDeleteAlert}
      onConfirm={handleConfirmBtnClick}
      loading={isLoading}
    >
      <p data-testId={'bank-rule-delete-alert'}>
        {intl.get('are_you_sure_want_to_delete_the_bank_rule')}
      </p>
    </Alert>
  );
}

export const DeleteBankRuleAlert = compose(
  withAlertStoreConnect(),
  withAlertActions,
  withDrawerActions,
)(BankRuleDeleteAlert);
