// @ts-nocheck
import intl from 'react-intl-universal';
import React from 'react';
import { Dialog, DialogSuspense } from '@/components';
import withDialogRedux from '@/components/DialogReduxConnect';
import { compose } from '@/utils';

const RuleFormContent = React.lazy(() =>
  import('./RuleFormContent').then((m) => ({ default: m.RuleFormContent })),
);

/**
 * Payment mail dialog.
 */
function RuleFormDialogRoot({
  dialogName,
  payload: { bankRuleId = null },
  isOpen,
}) {
  return (
    <Dialog
      name={dialogName}
      title={
        bankRuleId ? intl.get('edit_bank_rule') : intl.get('new_bank_rule')
      }
      isOpen={isOpen}
      canEscapeJeyClose={true}
      autoFocus={true}
      style={{ width: 600 }}
    >
      <DialogSuspense testId={'rule-form-dialog'}>
        <RuleFormContent dialogName={dialogName} bankRuleId={bankRuleId} />
      </DialogSuspense>
    </Dialog>
  );
}

export const RuleFormDialog = compose(withDialogRedux())(RuleFormDialogRoot);

RuleFormDialog.displayName = 'RuleFormDialog';
