import intl from 'react-intl-universal';
import { camelCase, get, upperFirst } from 'lodash';
import { MoneyCategoryPerCreditAccountRootType } from '@/constants/cashflowOptions';

export const initialValues = {
  name: '',
  order: 0,
  applyIfAccountId: '',
  applyIfTransactionType: 'deposit',
  conditionsType: 'and',
  conditions: [
    {
      field: 'description',
      comparator: 'contains',
      value: '',
    },
  ],
  assignCategory: '',
  assignAccountId: '',
};

export interface RuleFormValues {
  name: string;
  order: number;
  applyIfAccountId: string;
  applyIfTransactionType: string;
  conditionsType: string;
  conditions: Array<{
    field: string;
    comparator: string;
    value: string;
  }>;
  assignCategory: string;
  assignAccountId: string;
}

export const TransactionTypeOptions = [
  { value: 'deposit', text: intl.get('deposit') },
  { value: 'withdrawal', text: intl.get('withdrawal') },
];
export const Fields = [
  { value: 'description', text: intl.get('description') },
  { value: 'amount', text: intl.get('amount') },
  { value: 'payee', text: intl.get('payee') },
];

export const TextFieldConditions = [
  { value: 'contains', text: intl.get('contains') },
  { value: 'equals', text: intl.get('equals') },
  { value: 'not_contains', text: intl.get('not_contains') },
];
export const NumberFieldConditions = [
  { value: 'equal', text: intl.get('equal') },
  { value: 'bigger', text: intl.get('bigger') },
  { value: 'bigger_or_equal', text: intl.get('bigger_or_equal') },
  { value: 'smaller', text: intl.get('smaller') },
  { value: 'smaller_or_equal', text: intl.get('smaller_or_equal') },
];

export const FieldCondition = [
  ...TextFieldConditions,
  ...NumberFieldConditions,
];

export const AssignTransactionTypeOptions = [
  { value: 'expense', text: intl.get('expense') },
];

export const getAccountRootFromMoneyCategory = (category: string): string[] => {
  const _category = upperFirst(camelCase(category));

  return get(MoneyCategoryPerCreditAccountRootType, _category) || [];
};

export const getFieldConditionsByFieldKey = (fieldKey?: string) => {
  switch (fieldKey) {
    case 'amount':
      return NumberFieldConditions;
    default:
      return TextFieldConditions;
  }
};

export const getDefaultFieldConditionByFieldKey = (fieldKey?: string) => {
  switch (fieldKey) {
    case 'amount':
      return 'bigger_or_equal';
    default:
      return 'contains';
  }
};
