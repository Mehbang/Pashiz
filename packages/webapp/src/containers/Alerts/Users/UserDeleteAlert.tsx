import { Alert, Intent } from '@blueprintjs/core';
import React from 'react';
import intl from 'react-intl-universal';
import { AppToaster, FormattedMessage as T } from '@/components';
import { withAlertActions } from '@/containers/Alert/withAlertActions';
import type { WithAlertActionsProps } from '@/containers/Alert/withAlertActions';
import { withAlertStoreConnect } from '@/containers/Alert/withAlertStoreConnect';
import { useDeleteUser } from '@/hooks/query';
import { compose } from '@/utils';

interface UserDeleteAlertPayload {
  userId: number;
}

interface UserDeleteAlertProps extends WithAlertActionsProps {
  name: string;
  isOpen: boolean;
  payload: UserDeleteAlertPayload;
}

interface UserDeleteError {
  type: string;
}

/**
 * User delete alert.
 */
function UserDeleteAlertInner({
  name,
  isOpen,
  payload: { userId },
  closeAlert,
}: UserDeleteAlertProps): React.ReactElement {
  const { mutateAsync: deleteUserMutate, isPending: isLoading } =
    useDeleteUser();

  const handleCancelUserDelete = () => {
    closeAlert(name);
  };

  const handleConfirmUserDelete = () => {
    deleteUserMutate(userId)
      .then(() => {
        AppToaster.show({
          message: intl.get('the_user_has_been_deleted_successfully'),
          intent: Intent.SUCCESS,
        });
      })
      .catch(
        ({ data: { errors } }: { data: { errors: UserDeleteError[] } }) => {
          if (errors.find((e) => e.type === 'CANNOT_DELETE_LAST_USER')) {
            AppToaster.show({
              message: intl.get('cannot_delete_the_last_user_in_the_system'),
              intent: Intent.DANGER,
            });
          }
        },
      )
      .finally(() => {
        closeAlert(name);
      });
  };

  return (
    <Alert
      cancelButtonText={intl.get('cancel')}
      confirmButtonText={intl.get('delete')}
      intent={Intent.DANGER}
      isOpen={isOpen}
      onCancel={handleCancelUserDelete}
      onConfirm={handleConfirmUserDelete}
      loading={isLoading}
    >
      <p>
        {intl.get(
          'once_you_delete_this_user_you_won_t_be_able_to_restore_it_la',
        )}
      </p>
    </Alert>
  );
}

export const UserDeleteAlert = compose(
  withAlertStoreConnect(),
  withAlertActions,
)(UserDeleteAlertInner);
