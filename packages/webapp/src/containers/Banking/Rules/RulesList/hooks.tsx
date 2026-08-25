// @ts-nocheck
import intl from 'react-intl-universal';
import { Intent, Tag } from '@blueprintjs/core';
import { useMemo } from 'react';

const applyToTypeAccessor = (rule) => {
  return rule.apply_if_transaction_type === 'deposit' ? (
    <Tag round intent={Intent.SUCCESS}>
      {intl.get('deposits')}
    </Tag>
  ) : (
    <Tag round intent={Intent.DANGER}>
      {intl.get('withdrawals')}
    </Tag>
  );
};

const conditionsAccessor = (rule) => (
  <span style={{ fontSize: 12 }}>{rule.conditions_formatted}</span>
);

const applyToAccessor = (rule) => (
  <Tag intent={Intent.NONE} minimal>
    {rule.assign_account_name}
  </Tag>
);

export const useBankRulesTableColumns = () => {
  return useMemo(
    () => [
      {
        Header: intl.get('apply_to'),
        accessor: applyToTypeAccessor,
      },
      {
        Header: intl.get('rule_name'),
        accessor: 'name',
      },
      {
        Header: intl.get('categorize_as'),
        accessor: 'assign_category_formatted',
      },
      {
        Header: intl.get('apply_to'),
        accessor: applyToAccessor,
      },
      {
        Header: intl.get('conditions'),
        accessor: conditionsAccessor,
      },
    ],
    [],
  );
};
