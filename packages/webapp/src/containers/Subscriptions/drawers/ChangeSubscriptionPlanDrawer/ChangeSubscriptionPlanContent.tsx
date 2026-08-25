// @ts-nocheck
import intl from 'react-intl-universal';
import { Callout, Classes } from '@blueprintjs/core';
import * as R from 'ramda';
import { ChangeSubscriptionPlans } from './ChangeSubscriptionPlans';
import { Box } from '@/components';
import { SubscriptionPlansPeriodSwitcher } from '@/containers/Setup/SetupSubscription/SubscriptionPlansPeriodSwitcher';

export function ChangeSubscriptionPlanContent() {
  return (
    <Box className={Classes.DRAWER_BODY}>
      <Box
        style={{
          maxWidth: 1024,
          margin: '0 auto',
          padding: '50px 20px 80px',
        }}
      >
        <Callout style={{ marginBottom: '2rem' }} icon={null}>
          {intl.get(
            'simple_plans_simple_prices_only_pay_for_what_you_really_need',
          )}
        </Callout>

        <SubscriptionPlansPeriodSwitcher />
        <ChangeSubscriptionPlans />
      </Box>
    </Box>
  );
}
