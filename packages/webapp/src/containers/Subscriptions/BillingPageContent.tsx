// @ts-nocheck
import intl from 'react-intl-universal';
import { Spinner, Text } from '@blueprintjs/core';
import { useBillingPageBoot } from './BillingPageBoot';
import styles from './BillingPageContent.module.scss';
import { Subscription } from './BillingSubscription';
import { Box, Group } from '@/components';

export function BillingPageContent() {
  const { isSubscriptionsLoading, subscriptions } = useBillingPageBoot();

  if (isSubscriptionsLoading || !subscriptions) {
    return <Spinner size={30} />;
  }

  return (
    <Box className={styles.root}>
      <Text>
        {intl.get(
          'only_pay_for_what_you_really_need_all_plans_come_with_24_7_c',
        )}
      </Text>

      <Group style={{ marginTop: '2rem' }}>
        <Subscription />
      </Group>
    </Box>
  );
}
