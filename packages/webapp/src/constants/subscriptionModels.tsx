import intl from 'react-intl-universal';
export interface SubscriptionPlanFeature {
  text: string;
  hint?: string;
  hintLabel?: string;
  label?: string;
  style?: Record<string, string>;
}
export interface SubscriptionPlan {
  name: string;
  slug: string;
  description: string;
  features: SubscriptionPlanFeature[];
  featured?: boolean;
  monthlyPrice: string;
  monthlyPriceLabel: string;
  annuallyPrice: string;
  annuallyPriceLabel: string;
  monthlyVariantId: string;
  annuallyVariantId: string;
}

export const SubscriptionPlans = [
  {
    name: intl.get('capital_basic'),
    slug: 'capital_basic',
    description: intl.get('good_for_service_businesses_that_just_started'),
    features: [
      {
        text: intl.get('unlimited_sale_invoices'),
        hintLabel: intl.get('unlimited_sale_invoices'),
        hint: 'Good for service businesses that just started for service businesses that just started',
      },
      { text: intl.get('unlimated_sale_estimates') },
      { text: intl.get('track_gst_and_vat') },
      { text: intl.get('connect_banks_for_automatic_importing') },
      { text: intl.get('chart_of_accounts') },
      {
        text: intl.get('manual_journals'),
        hintLabel: intl.get('manual_journals'),
        hint: 'Write manual journals entries for financial transactions not automatically captured by the system to adjust financial statements.',
      },
      {
        text: intl.get('basic_financial_reports_insights'),
        hint: 'Balance sheet, profit & loss statement, cashflow statement, general ledger, journal sheet, A/P aging summary, A/R aging summary',
      },
      { text: intl.get('unlimited_user_seats') },
    ],
    monthlyPrice: '$20',
    monthlyPriceLabel: intl.get('per_month'),
    annuallyPrice: '$15',
    annuallyPriceLabel: intl.get('per_month'),
    monthlyVariantId: '446152',
    // monthlyVariantId: '450016',
    annuallyVariantId: '446153',
    // annuallyVariantId: '450018',
  },
  {
    name: intl.get('capital_essential'),
    slug: 'capital_plus',
    description: intl.get(
      'good_for_have_inventory_and_want_more_financial_reports',
    ),
    features: [
      { text: intl.get('all_capital_basic_features') },
      { text: intl.get('purchase_invoices') },
      {
        text: intl.get('multi_currency_transactions'),
        hintLabel: intl.get('multi_currency'),
        hint: 'Pay and get paid and do manual journals in any currency with real time exchange rates conversions.',
      },
      {
        text: intl.get('transactions_locking'),
        hintLabel: intl.get('transactions_locking'),
        hint: 'Transaction Locking freezes transactions to prevent any additions, modifications, or deletions of transactions recorded during the specified date.',
      },
      {
        text: intl.get('inventory_tracking'),
        hintLabel: intl.get('inventory_tracking'),
        hint: 'Track goods in the stock, cost of goods, and get notifications when quantity is low.',
      },
      { text: intl.get('smart_financial_reports') },
      { text: intl.get('advanced_inventory_reports') },
    ],
    monthlyPrice: '$40',
    monthlyPriceLabel: intl.get('per_month'),
    annuallyPrice: '$30',
    annuallyPriceLabel: intl.get('per_month'),
    // monthlyVariantId: '450028',
    monthlyVariantId: '446155',
    // annuallyVariantId: '450029',
    annuallyVariantId: '446156',
  },
  {
    name: intl.get('capital_plus'),
    slug: 'essentials',
    description: intl.get(
      'good_for_business_want_financial_and_access_control',
    ),
    features: [
      { text: intl.get('all_capital_essential_features') },
      { text: intl.get('custom_user_roles_access') },
      { text: intl.get('sidebar_vendor_credits') },
      {
        text: intl.get('budgeting'),
        hint: 'Create multiple budgets and compare targets with actuals to understand how your business is performing.',
      },
      { text: intl.get('analysis_cost_center') },
    ],
    monthlyPrice: '$55',
    monthlyPriceLabel: intl.get('per_month'),
    annuallyPrice: '$40',
    annuallyPriceLabel: intl.get('per_month'),
    featured: true,
    // monthlyVariantId: '450031',
    monthlyVariantId: '446165',
    // annuallyVariantId: '450032',
    annuallyVariantId: '446164',
  },
  {
    name: intl.get('capital_big'),
    slug: 'essentials',
    description: intl.get('good_for_businesses_have_multiple_branches'),
    features: [
      { text: intl.get('all_capital_plus_features') },
      {
        text: intl.get('multiple_branches'),
        hintLabel: '',
        hint: intl.get(
          'track_the_organization_transactions_and_accounts_in_multiple',
        ),
      },
      {
        text: intl.get('multiple_warehouses'),
        hintLabel: intl.get('multiple_warehouses'),
        hint: 'Track the organization inventory in multiple warehouses and transfer goods between them.',
      },
    ],
    monthlyPrice: '$60',
    monthlyPriceLabel: intl.get('per_month'),
    annuallyPrice: '$45',
    annuallyPriceLabel: intl.get('per_month'),
    // monthlyVariantId: '450024',
    monthlyVariantId: '446167',
    // annuallyVariantId: '450025',
    annuallyVariantId: '446168',
  },
] as SubscriptionPlan[];
