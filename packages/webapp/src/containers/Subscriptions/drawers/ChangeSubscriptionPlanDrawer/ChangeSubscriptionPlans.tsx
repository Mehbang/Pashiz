// @ts-nocheck
import intl from 'react-intl-universal';
import { Intent } from '@blueprintjs/core';
import * as R from 'ramda';
import { SubscriptionPlan } from '../../component/SubscriptionPlan';
import { withSubscriptionPlanMapper } from '../../component/withSubscriptionPlanMapper';
import { withPlans } from '../../withPlans';
import { AppToaster, Group } from '@/components';
import { DRAWERS } from '@/constants/drawers';
import { withDrawerActions } from '@/containers/Drawer/withDrawerActions';
import { useSubscriptionPlans } from '@/hooks/constants/useSubscriptionPlans';
import { useChangeSubscriptionPlan } from '@/hooks/query/subscription';
import { SubscriptionPlansPeriod } from '@/store/plans/plans.reducer';

export function ChangeSubscriptionPlans() {
  const subscriptionPlans = useSubscriptionPlans();

  return (
    <Group spacing={14} noWrap align="stretch">
      {subscriptionPlans.map((plan, index) => (
        <SubscriptionPlanMapped plan={plan} />
      ))}
    </Group>
  );
}

export const SubscriptionPlanMapped = R.compose(
  withSubscriptionPlanMapper,
  withDrawerActions,
  withPlans(({ plansPeriod }) => ({ plansPeriod })),
)(({
  openDrawer,
  closeDrawer,
  monthlyVariantId,
  annuallyVariantId,
  plansPeriod,
  ...props
}) => {
  const { mutateAsync: changeSubscriptionPlan, isLoading } =
    useChangeSubscriptionPlan();

  // Handles the subscribe button click.
  const handleSubscribe = () => {
    const variantId =
      plansPeriod === SubscriptionPlansPeriod.Monthly
        ? monthlyVariantId
        : annuallyVariantId;

    changeSubscriptionPlan({ variant_id: variantId })
      .then(() => {
        closeDrawer(DRAWERS.CHANGE_SUBSCARIPTION_PLAN);
        AppToaster.show({
          message: intl.get('the_subscription_plan_has_been_changed'),
          intent: Intent.SUCCESS,
        });
      })
      .catch((error) => {
        AppToaster.show({
          message: intl.get('something_wentwrong'),
          intent: Intent.DANGER,
        });
      });
  };
  return (
    <SubscriptionPlan
      {...props}
      onSubscribe={handleSubscribe}
      subscribeButtonProps={{ loading: isLoading }}
    />
  );
});
