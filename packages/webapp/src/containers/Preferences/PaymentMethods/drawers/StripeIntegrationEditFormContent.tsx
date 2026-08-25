import intl from 'react-intl-universal';
import { Button, Intent } from '@blueprintjs/core';
import { useFormikContext } from 'formik';
import { useStripeIntegrationEditBoot } from './StripeIntegrationEditBoot';
import { AccountsSelect, FFormGroup, Group, Stack } from '@/components';
import { useDrawerContext } from '@/components/Drawer/DrawerProvider';
import { ACCOUNT_TYPE } from '@/constants';
import { useDrawerActions } from '@/hooks/state';

export function StripeIntegrationEditFormContent() {
  const { accounts } = useStripeIntegrationEditBoot();

  return (
    <Stack spacing={0} style={{ padding: 20 }}>
      <FFormGroup
        name={'bankAccountId'}
        label={intl.get('bank_account')}
        style={{ maxWidth: 300 }}
        helperText={intl.get(
          'the_bank_account_where_the_stripe_payout_is_deposited',
        )}
      >
        <AccountsSelect
          name={'bankAccountId'}
          items={accounts}
          filterByTypes={[ACCOUNT_TYPE.CASH, ACCOUNT_TYPE.BANK]}
          fastField
          fill
          allowCreate
        />
      </FFormGroup>

      <FFormGroup
        name={'clearingAccountId'}
        label={intl.get('clearing_account')}
        subLabel="Liability Account"
        helperText={intl.get(
          'clearing_account_tracks_all_payments_collected_through_strip',
        )}
        style={{ maxWidth: 300 }}
      >
        <AccountsSelect
          name={'clearingAccountId'}
          items={accounts}
          filterByTypes={[ACCOUNT_TYPE.OTHER_CURRENT_LIABILITY]}
          fastField
          fill
          allowCreate
        />
      </FFormGroup>
    </Stack>
  );
}

export function StripeIntegrationEditFormFooter() {
  const { name } = useDrawerContext();
  const { closeDrawer } = useDrawerActions();
  const { submitForm, isSubmitting } = useFormikContext();

  const handleSubmitBtnClick = () => {
    submitForm();
  };
  const handleCancelBtnClick = () => {
    closeDrawer(name);
  };

  return (
    <>
      <Group spacing={10}>
        <Button
          intent={Intent.PRIMARY}
          loading={isSubmitting}
          onClick={handleSubmitBtnClick}
        >
          Save
        </Button>
        <Button onClick={handleCancelBtnClick}>{intl.get('cancel')}</Button>
      </Group>
    </>
  );
}
