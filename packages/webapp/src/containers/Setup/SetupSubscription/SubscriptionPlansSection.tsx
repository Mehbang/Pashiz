import intl from 'react-intl-universal';
import { Callout } from '@blueprintjs/core';
import { SubscriptionPlans } from './SubscriptionPlans';
import { SubscriptionPlansOfferChecks } from './SubscriptionPlansOfferChecks';
import { SubscriptionPlansPeriodSwitcher } from './SubscriptionPlansPeriodSwitcher';

/**
 * Billing plans.
 */
export function SubscriptionPlansSection() {
  return (
    <section>
      <Callout style={{ marginBottom: '2rem' }} icon={null}>
        {intl.get(
          'simple_plans_simple_prices_only_pay_for_what_you_really_need',
        )}
      </Callout>

      <SubscriptionPlansOfferChecks />
      <SubscriptionPlansPeriodSwitcher />
      <SubscriptionPlans />
    </section>
  );
}
