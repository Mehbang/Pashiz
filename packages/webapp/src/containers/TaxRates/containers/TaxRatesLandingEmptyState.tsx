import intl from 'react-intl-universal';
import { Button, Intent } from '@blueprintjs/core';
import * as R from 'ramda';
import { EmptyStatus, Can, FormattedMessage as T } from '@/components';
import { SaleInvoiceAction, AbilitySubject } from '@/constants/abilityOption';
import { DialogsName } from '@/constants/dialogs';
import {
  withDialogActions,
  WithDialogActionsProps,
} from '@/containers/Dialog/withDialogActions';

function TaxRatesLandingEmptyStateRoot({
  openDialog,
}: Pick<WithDialogActionsProps, 'openDialog'>) {
  return (
    <EmptyStatus
      title={"The organization doesn't have taxes, yet!"}
      description={
        <p>
          {intl.get(
            'setup_the_organization_taxes_to_start_tracking_taxes_on_sale',
          )}
        </p>
      }
      action={
        <>
          <Can I={SaleInvoiceAction.Create} a={AbilitySubject.Invoice}>
            <Button
              intent={Intent.PRIMARY}
              large={true}
              onClick={() => {
                openDialog(DialogsName.TaxRateForm);
              }}
            >
              {intl.get('new_tax_rate')}
            </Button>
            <Button intent={Intent.NONE} large={true}>
              <T id={'learn_more'} />
            </Button>
          </Can>
        </>
      }
    />
  );
}

export const TaxRatesLandingEmptyState = R.compose(withDialogActions)(
  TaxRatesLandingEmptyStateRoot,
);
