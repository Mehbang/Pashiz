import { Intent, Alert } from '@blueprintjs/core';
import intl from 'react-intl-universal';
import { AppToaster } from '@/components';
import { DRAWERS } from '@/constants/drawers';
import {
  withAlertActions,
  WithAlertActionsProps,
} from '@/containers/Alert/withAlertActions';
import {
  withAlertStoreConnect,
  WithAlertStoreConnectProps,
} from '@/containers/Alert/withAlertStoreConnect';
import {
  withDrawerActions,
  WithDrawerActionsProps,
} from '@/containers/Drawer/withDrawerActions';
import { useDeleteTaxRate } from '@/hooks/query/tax-rates';
import { compose } from '@/utils';

interface TaxRateDeleteAlertInnerProps
  extends Pick<WithAlertStoreConnectProps, 'isOpen'>,
    Pick<WithAlertActionsProps, 'closeAlert'>,
    Pick<WithDrawerActionsProps, 'closeDrawer'> {
  name: string;
  payload: { taxRateId: number };
}

/**
 * Item delete alerts.
 */
function TaxRateDeleteAlertInner({
  name,
  isOpen,
  payload: { taxRateId },
  closeAlert,
  closeDrawer,
}: TaxRateDeleteAlertInnerProps) {
  const { mutateAsync: deleteTaxRate, isPending } = useDeleteTaxRate();

  // Handle cancel delete item alert.
  const handleCancelItemDelete = () => {
    closeAlert(name);
  };
  // Handle confirm delete item.
  const handleConfirmDeleteItem = () => {
    deleteTaxRate(taxRateId)
      .then(() => {
        AppToaster.show({
          message: intl.get('the_tax_rate_has_been_deleted_successfully'),
          intent: Intent.SUCCESS,
        });
        closeDrawer(DRAWERS.TAX_RATE_DETAILS);
      })
      .catch(() => {
        AppToaster.show({
          message: intl.get('something_wentwrong'),
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
      confirmButtonText={intl.get('delete')}
      icon="trash"
      intent={Intent.DANGER}
      isOpen={isOpen}
      onCancel={handleCancelItemDelete}
      onConfirm={handleConfirmDeleteItem}
      loading={isPending}
    >
      <p>
        {intl.get(
          'once_you_delete_this_tax_rate_you_won_t_be_able_to_restore_t',
        )}
      </p>

      <p>
        {intl.get(
          'are_you_sure_you_want_to_delete_if_you_re_not_sure_you_can_i',
        )}
      </p>
    </Alert>
  );
}

export const TaxRateDeleteAlert = compose(
  withAlertStoreConnect(),
  withAlertActions,
  withDrawerActions,
)(TaxRateDeleteAlertInner);
