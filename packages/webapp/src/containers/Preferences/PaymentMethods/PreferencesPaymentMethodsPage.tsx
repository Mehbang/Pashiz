import intl from 'react-intl-universal';
import { Classes, Text } from '@blueprintjs/core';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { StripePreSetupDialog } from './dialogs/StripePreSetupDialog/StripePreSetupDialog';
import { StripeIntegrationEditDrawer } from './drawers/StripeIntegrationEditDrawer';
import { PaymentMethodsBoot } from './PreferencesPaymentMethodsBoot';
import { StripePaymentMethod } from './StripePaymentMethod';
import { Box, Stack } from '@/components';
import { DialogsName } from '@/constants/dialogs';
import { DRAWERS } from '@/constants/drawers';
import { useChangePreferencesPageTitle } from '@/hooks/state';

/**
 * Payment methods page.
 */
export function PreferencesPaymentMethodsPage() {
  const changePageTitle = useChangePreferencesPageTitle();

  useEffect(() => {
    changePageTitle(intl.get('payment_methods'));
  }, [changePageTitle]);

  return (
    <PaymentMethodsRoot>
      <PaymentMethodsBoot>
        <Text className={Classes.TEXT_MUTED} style={{ marginBottom: 20 }}>
          {intl.get(
            'accept_payments_from_all_the_major_debit_and_credit_card_net',
          )}
        </Text>

        <Stack>
          <StripePaymentMethod />
        </Stack>

        <StripePreSetupDialog dialogName={DialogsName.StripeSetup} />
        <StripeIntegrationEditDrawer
          name={DRAWERS.STRIPE_PAYMENT_INTEGRATION_EDIT}
        />
      </PaymentMethodsBoot>
    </PaymentMethodsRoot>
  );
}

const PaymentMethodsRoot = styled(Box)`
  witdth: 100%;
  max-width: 700px;
  margin: 20px;
`;
