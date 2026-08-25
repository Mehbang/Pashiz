// @ts-nocheck
import intl from 'react-intl-universal';
export const getSubscriptionStatusText = (subscription) => {
  if (subscription.status === 'on_trial') {
    return subscription.onTrial
      ? `Trials ends in ${subscription.trialEndsAtFormatted}`
      : `Trial ended ${subscription.trialEndsAtFormatted}`;
  } else if (subscription.status === 'active') {
    return subscription.endsAtFormatted
      ? `Renews in ${subscription.endsAtFormatted}`
      : intl.get('lifetime_subscription');
  } else if (subscription.status === 'canceled') {
    return subscription.ended
      ? `Expires ${subscription.endsAtFormatted}`
      : `Expired ${subscription.endsAtFormatted}`;
  }
  return '';
};
