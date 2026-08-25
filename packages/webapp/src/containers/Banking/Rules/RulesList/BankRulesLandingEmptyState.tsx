// @ts-nocheck
import intl from 'react-intl-universal';
import { Button, Intent } from '@blueprintjs/core';
import * as R from 'ramda';
import styles from './BankRulesLandingEmptyState.module.scss';
import { EmptyStatus, Can, FormattedMessage as T } from '@/components';
import { AbilitySubject, BankRuleAction } from '@/constants/abilityOption';
import { DialogsName } from '@/constants/dialogs';
import { withDialogActions } from '@/containers/Dialog/withDialogActions';

function BankRulesLandingEmptyStateRoot({
  // #withDialogAction
  openDialog,
}) {
  const handleNewBtnClick = () => {
    openDialog(DialogsName.BankRuleForm);
  };

  return (
    <EmptyStatus
      title={intl.get(
        'create_rules_to_categorize_bank_transactions_automatically',
      )}
      description={
        <p>
          {intl.get(
            'bank_rules_will_run_automatically_to_categorize_the_incoming',
          )}
        </p>
      }
      action={
        <>
          <Can I={BankRuleAction.Create} a={AbilitySubject.BankRule}>
            <Button
              intent={Intent.PRIMARY}
              large={true}
              onClick={handleNewBtnClick}
            >
              {intl.get('new_bank_rule')}
            </Button>

            <Button intent={Intent.NONE} large={true}>
              <T id={'learn_more'} />
            </Button>
          </Can>
        </>
      }
      classNames={{ root: styles.root }}
    />
  );
}

export const BankRulesLandingEmptyState = R.compose(withDialogActions)(
  BankRulesLandingEmptyStateRoot,
);
