// @ts-nocheck
import intl from 'react-intl-universal';
import * as R from 'ramda';
import { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { withAlertActions } from '../Alert/withAlertActions';
import { withDashboardActions } from '../Dashboard/withDashboardActions';
import { BillingPageBoot } from './BillingPageBoot';
import { BillingPageContent } from './BillingPageContent';
import { useDashboardMeta } from '@/hooks/query';

function BillingPageRoot({
  openAlert,

  // #withAlertActions
  changePreferencesPageTitle,
}) {
  const { data: dashboardMeta } = useDashboardMeta({
    keepPreviousData: true,
  });

  useEffect(() => {
    changePreferencesPageTitle(intl.get('billing'));
  }, [changePreferencesPageTitle]);

  // In case the edition is not Bigcapital Cloud, redirect to the homepage.
  if (!dashboardMeta.isBigcapitalCloud) {
    return <Redirect to={{ pathname: '/' }} />;
  }

  return (
    <BillingPageBoot>
      <BillingPageContent />
    </BillingPageBoot>
  );
}

export const BillingPage = R.compose(
  withAlertActions,
  withDashboardActions,
)(BillingPageRoot);
