import intl from 'react-intl-universal';
import {
  Button,
  Classes,
  Intent,
  Menu,
  MenuItem,
  Popover,
  Tag,
  Text,
  Tooltip,
} from '@blueprintjs/core';
import React from 'react';
import styled from 'styled-components';
import { STRIPE_PRICING_LINK } from './constants';
import { usePaymentMethodsBoot } from './PreferencesPaymentMethodsBoot';
import { Box, Card, Group, Stack } from '@/components';
import { DialogsName } from '@/constants/dialogs';
import { DRAWERS } from '@/constants/drawers';
import {
  useAlertActions,
  useDialogActions,
  useDrawerActions,
} from '@/hooks/state';
import { useIsDarkMode } from '@/hooks/useDarkMode';
import { MoreIcon } from '@/icons/More';
import { StripeLogo } from '@/icons/StripeLogo';

export function StripePaymentMethod() {
  const { openDialog } = useDialogActions();
  const { openDrawer } = useDrawerActions();
  const { openAlert } = useAlertActions();
  const isDarkMode = useIsDarkMode();

  const { paymentMethodsState } = usePaymentMethodsBoot();
  const stripeState = paymentMethodsState?.stripe;

  const isAccountCreated = stripeState?.isStripeAccountCreated;
  const isPaymentEnabled = stripeState?.isStripePaymentEnabled;
  const isPayoutEnabled = stripeState?.isStripePayoutEnabled;
  const isStripeEnabled = stripeState?.isStripeEnabled;
  const stripePaymentMethodId = stripeState?.stripePaymentMethodId;
  const isStripeServerConfigured = stripeState?.isStripeServerConfigured;

  // Handle Stripe setup button click.
  const handleSetUpBtnClick = () => {
    openDialog(DialogsName.StripeSetup);
  };

  // Handle edit button click.
  const handleEditBtnClick = () => {
    openDrawer(DRAWERS.STRIPE_PAYMENT_INTEGRATION_EDIT, {
      stripePaymentMethodId: stripePaymentMethodId,
    });
  };

  // Handle delete connection button click.
  const handleDeleteConnectionClick = () => {
    openAlert('delete-stripe-payment-method', {
      paymentMethodId: stripePaymentMethodId,
    });
  };

  return (
    <Card style={{ margin: 0 }}>
      <Group position="apart">
        <Group>
          <StripeLogo
            color={isDarkMode ? 'rgba(255, 255, 255, 0.85)' : '#0A2540'}
          />
          <Group spacing={10}>
            {isStripeEnabled && (
              <Tag minimal intent={Intent.SUCCESS}>
                {intl.get('active')}
              </Tag>
            )}
            {!isPaymentEnabled && isAccountCreated && (
              <Tooltip content="The account cannot accept payments because verification may be incomplete, there may be legal or compliance issues, or required documents haven't been submitted or verified.">
                <Tag minimal intent={Intent.DANGER}>
                  {intl.get('payment_not_enabled')}
                </Tag>
              </Tooltip>
            )}
            {!isPayoutEnabled && isAccountCreated && (
              <Tooltip content="The account cannot receive payouts due to incomplete or invalid bank details, pending identity verification, or compliance restrictions.">
                <Tag minimal intent={Intent.DANGER}>
                  {intl.get('payout_not_enabled')}
                </Tag>
              </Tooltip>
            )}
          </Group>
        </Group>
        <Group spacing={10}>
          {isAccountCreated && (
            <Button small onClick={handleEditBtnClick}>
              Edit
            </Button>
          )}
          {!isAccountCreated && (
            <Button intent={Intent.PRIMARY} small onClick={handleSetUpBtnClick}>
              {intl.get('set_it_up')}
            </Button>
          )}
          {isAccountCreated && (
            <Popover
              content={
                <Menu>
                  <MenuItem
                    intent={Intent.DANGER}
                    text={intl.get('delete_connection')}
                    onClick={handleDeleteConnectionClick}
                  />
                </Menu>
              }
            >
              <Button small icon={<MoreIcon height={10} width={10} />} />
            </Popover>
          )}
        </Group>
      </Group>

      <PaymentDescription
        className={Classes.TEXT_MUTED}
        style={{ fontSize: 13 }}
      >
        {intl.get(
          'stripe_is_a_secure_online_payment_platform_that_lets_you_eas',
        )}
      </PaymentDescription>

      <PaymentFooter>
        <Stack spacing={10}>
          <Text>
            <a target="_blank" rel="noreferrer" href={STRIPE_PRICING_LINK}>
              {intl.get('view_stripe_s_transaction_fees')}
            </a>
          </Text>

          {!isStripeServerConfigured && (
            <Text style={{ color: '#CD4246' }}>
              {intl.get('stripe_payment_is_not_configured')}{' '}
            </Text>
          )}
        </Stack>
      </PaymentFooter>
    </Card>
  );
}

const PaymentDescription = styled(Text)`
  font-size: 13px;
  margin-top: 12px;
`;

const PaymentFooter = styled(Box)`
  margin-top: 14px;
  font-size: 12px;
`;
