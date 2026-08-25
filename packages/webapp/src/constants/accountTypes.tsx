import intl from 'react-intl-universal';
export const ACCOUNT_TYPE = {
  CASH: 'cash',
  BANK: 'bank',
  ACCOUNTS_RECEIVABLE: 'accounts-receivable',
  INVENTORY: 'inventory',
  OTHER_CURRENT_ASSET: 'other-current-asset',
  FIXED_ASSET: 'fixed-asset',
  NON_CURRENT_ASSET: 'non-current-asset',

  ACCOUNTS_PAYABLE: 'accounts-payable',
  CREDIT_CARD: 'credit-card',
  TAX_PAYABLE: 'tax-payable',
  OTHER_CURRENT_LIABILITY: 'other-current-liability',
  LOGN_TERM_LIABILITY: 'long-term-liability',
  NON_CURRENT_LIABILITY: 'non-current-liability',

  EQUITY: 'equity',
  INCOME: 'income',
  OTHER_INCOME: 'other-income',
  COST_OF_GOODS_SOLD: 'cost-of-goods-sold',
  EXPENSE: 'expense',
  OTHER_EXPENSE: 'other-expense',
} as const;

export const ACCOUNT_PARENT_TYPE = {
  CURRENT_ASSET: 'current-asset',
  FIXED_ASSET: 'fixed-asset',
  NON_CURRENT_ASSET: 'non-current-asset',

  CURRENT_LIABILITY: 'current-liability',
  LOGN_TERM_LIABILITY: 'long-term-liability',
  NON_CURRENT_LIABILITY: 'non-current-liability',

  EQUITY: 'equity',
  EXPENSE: 'expense',
  INCOME: 'income',
} as const;

export const ACCOUNT_ROOT_TYPE = {
  ASSET: 'asset',
  LIABILITY: 'liability',
  EQUITY: 'equity',
  EXPENSE: 'expense',
  INCOME: 'income',
} as const;

export const ACCOUNT_NORMAL = {
  CREDIT: 'credit',
  DEBIT: 'debit',
} as const;

export interface AccountTypeOption {
  label: string;
  key: (typeof ACCOUNT_TYPE)[keyof typeof ACCOUNT_TYPE];
  normal: (typeof ACCOUNT_NORMAL)[keyof typeof ACCOUNT_NORMAL];
  parentType: (typeof ACCOUNT_PARENT_TYPE)[keyof typeof ACCOUNT_PARENT_TYPE];
  rootType: (typeof ACCOUNT_ROOT_TYPE)[keyof typeof ACCOUNT_ROOT_TYPE];
  balanceSheet: boolean;
  incomeSheet: boolean;
}

export const ACCOUNT_TYPES: AccountTypeOption[] = [
  {
    label: intl.get('cash'),
    key: ACCOUNT_TYPE.CASH,
    normal: ACCOUNT_NORMAL.DEBIT,
    parentType: ACCOUNT_PARENT_TYPE.CURRENT_ASSET,
    rootType: ACCOUNT_ROOT_TYPE.ASSET,
    balanceSheet: true,
    incomeSheet: false,
  },
  {
    label: intl.get('bank'),
    key: ACCOUNT_TYPE.BANK,
    normal: ACCOUNT_NORMAL.DEBIT,
    parentType: ACCOUNT_PARENT_TYPE.CURRENT_ASSET,
    rootType: ACCOUNT_ROOT_TYPE.ASSET,
    balanceSheet: true,
    incomeSheet: false,
  },
  {
    label: intl.get('accounts_receivable'),
    key: ACCOUNT_TYPE.ACCOUNTS_RECEIVABLE,
    normal: ACCOUNT_NORMAL.DEBIT,
    rootType: ACCOUNT_ROOT_TYPE.ASSET,
    parentType: ACCOUNT_PARENT_TYPE.CURRENT_ASSET,
    balanceSheet: true,
    incomeSheet: false,
  },
  {
    label: intl.get('inventory'),
    key: ACCOUNT_TYPE.INVENTORY,
    normal: ACCOUNT_NORMAL.DEBIT,
    rootType: ACCOUNT_ROOT_TYPE.ASSET,
    parentType: ACCOUNT_PARENT_TYPE.CURRENT_ASSET,
    balanceSheet: true,
    incomeSheet: false,
  },
  {
    label: intl.get('other_current_asset'),
    key: ACCOUNT_TYPE.OTHER_CURRENT_ASSET,
    normal: ACCOUNT_NORMAL.DEBIT,
    rootType: ACCOUNT_ROOT_TYPE.ASSET,
    parentType: ACCOUNT_PARENT_TYPE.CURRENT_ASSET,
    balanceSheet: true,
    incomeSheet: false,
  },
  {
    label: intl.get('fixed_asset'),
    key: ACCOUNT_TYPE.FIXED_ASSET,
    normal: ACCOUNT_NORMAL.DEBIT,
    rootType: ACCOUNT_ROOT_TYPE.ASSET,
    parentType: ACCOUNT_PARENT_TYPE.FIXED_ASSET,
    balanceSheet: true,
    incomeSheet: false,
  },
  {
    label: intl.get('non_current_asset'),
    key: ACCOUNT_TYPE.NON_CURRENT_ASSET,
    normal: ACCOUNT_NORMAL.DEBIT,
    rootType: ACCOUNT_ROOT_TYPE.ASSET,
    parentType: ACCOUNT_PARENT_TYPE.FIXED_ASSET,
    balanceSheet: true,
    incomeSheet: false,
  },
  {
    label: intl.get('accounts_payable'),
    key: ACCOUNT_TYPE.ACCOUNTS_PAYABLE,
    normal: ACCOUNT_NORMAL.CREDIT,
    rootType: ACCOUNT_ROOT_TYPE.LIABILITY,
    parentType: ACCOUNT_PARENT_TYPE.CURRENT_LIABILITY,
    balanceSheet: true,
    incomeSheet: false,
  },
  {
    label: intl.get('credit_card'),
    key: ACCOUNT_TYPE.CREDIT_CARD,
    normal: ACCOUNT_NORMAL.CREDIT,
    rootType: ACCOUNT_ROOT_TYPE.LIABILITY,
    parentType: ACCOUNT_PARENT_TYPE.CURRENT_LIABILITY,
    balanceSheet: true,
    incomeSheet: false,
  },
  {
    label: intl.get('tax_payable'),
    key: ACCOUNT_TYPE.TAX_PAYABLE,
    normal: ACCOUNT_NORMAL.CREDIT,
    rootType: ACCOUNT_ROOT_TYPE.LIABILITY,
    parentType: ACCOUNT_PARENT_TYPE.CURRENT_LIABILITY,
    balanceSheet: true,
    incomeSheet: false,
  },
  {
    label: intl.get('other_current_liability'),
    key: ACCOUNT_TYPE.OTHER_CURRENT_LIABILITY,
    normal: ACCOUNT_NORMAL.CREDIT,
    rootType: ACCOUNT_ROOT_TYPE.LIABILITY,
    parentType: ACCOUNT_PARENT_TYPE.CURRENT_LIABILITY,
    balanceSheet: false,
    incomeSheet: true,
  },
  {
    label: intl.get('long_term_liability'),
    key: ACCOUNT_TYPE.LOGN_TERM_LIABILITY,
    normal: ACCOUNT_NORMAL.CREDIT,
    rootType: ACCOUNT_ROOT_TYPE.LIABILITY,
    parentType: ACCOUNT_PARENT_TYPE.LOGN_TERM_LIABILITY,
    balanceSheet: false,
    incomeSheet: true,
  },
  {
    label: intl.get('non_current_liability'),
    key: ACCOUNT_TYPE.NON_CURRENT_LIABILITY,
    normal: ACCOUNT_NORMAL.CREDIT,
    rootType: ACCOUNT_ROOT_TYPE.LIABILITY,
    parentType: ACCOUNT_PARENT_TYPE.NON_CURRENT_LIABILITY,
    balanceSheet: false,
    incomeSheet: true,
  },
  {
    label: intl.get('equity'),
    key: ACCOUNT_TYPE.EQUITY,
    normal: ACCOUNT_NORMAL.CREDIT,
    rootType: ACCOUNT_ROOT_TYPE.EQUITY,
    parentType: ACCOUNT_PARENT_TYPE.EQUITY,
    balanceSheet: true,
    incomeSheet: false,
  },
  {
    label: intl.get('income'),
    key: ACCOUNT_TYPE.INCOME,
    normal: ACCOUNT_NORMAL.CREDIT,
    rootType: ACCOUNT_ROOT_TYPE.INCOME,
    parentType: ACCOUNT_PARENT_TYPE.INCOME,
    balanceSheet: false,
    incomeSheet: true,
  },
  {
    label: intl.get('other_income'),
    key: ACCOUNT_TYPE.OTHER_INCOME,
    normal: ACCOUNT_NORMAL.CREDIT,
    rootType: ACCOUNT_ROOT_TYPE.INCOME,
    parentType: ACCOUNT_PARENT_TYPE.INCOME,
    balanceSheet: false,
    incomeSheet: true,
  },
  {
    label: intl.get('cost_of_goods_sold'),
    key: ACCOUNT_TYPE.COST_OF_GOODS_SOLD,
    normal: ACCOUNT_NORMAL.DEBIT,
    rootType: ACCOUNT_ROOT_TYPE.EXPENSE,
    parentType: ACCOUNT_PARENT_TYPE.EXPENSE,
    balanceSheet: false,
    incomeSheet: true,
  },
  {
    label: intl.get('expense'),
    key: ACCOUNT_TYPE.EXPENSE,
    normal: ACCOUNT_NORMAL.DEBIT,
    rootType: ACCOUNT_ROOT_TYPE.EXPENSE,
    parentType: ACCOUNT_PARENT_TYPE.EXPENSE,
    balanceSheet: false,
    incomeSheet: true,
  },
  {
    label: intl.get('other_expense'),
    key: ACCOUNT_TYPE.OTHER_EXPENSE,
    normal: ACCOUNT_NORMAL.DEBIT,
    rootType: ACCOUNT_ROOT_TYPE.EXPENSE,
    parentType: ACCOUNT_PARENT_TYPE.EXPENSE,
    balanceSheet: false,
    incomeSheet: true,
  },
];

export const FOREIGN_CURRENCY_ACCOUNTS: string[] = ['cash', 'bank'];
