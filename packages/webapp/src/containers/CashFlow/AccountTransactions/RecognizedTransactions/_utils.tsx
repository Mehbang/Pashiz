import intl from 'react-intl-universal';
import { Classes } from '@blueprintjs/core';
import clsx from 'classnames';
import React from 'react';
import { useRecognizedTransactionsBoot } from './RecognizedTransactionsTableBoot';
import type { DataTableColumn } from '@/components/Datatable/types';
import type { BankTransactionsListPage } from '@bigcapital/sdk-ts';
import { Icon } from '@/components';
import { getColumnWidth } from '@/utils';

export type RecognizedTransactionRow = NonNullable<
  BankTransactionsListPage['data']
>[number];

const getReportColWidth = (
  data: RecognizedTransactionRow[] | undefined,
  accessor: string,
  headerText: string,
) => {
  return getColumnWidth(
    data ?? [],
    accessor,
    { magicSpacing: 10, minWidth: 100 },
    headerText,
  );
};

const recognizeAccessor = (transaction: RecognizedTransactionRow) => {
  return (
    <>
      <span>{transaction.assignedCategoryFormatted}</span>
      <Icon
        icon={'arrowRight'}
        color={'#8F99A8'}
        iconSize={12}
        style={{ marginLeft: 8, marginRight: 8 }}
      />
      <span>{transaction.assignedAccountName}</span>
    </>
  );
};

/**
 * Retrieve recognized transactions columns table.
 */
export function useUncategorizedTransactionsColumns(): DataTableColumn<RecognizedTransactionRow>[] {
  const { recognizedTransactions: data } = useRecognizedTransactionsBoot();

  const withdrawalWidth = getReportColWidth(
    data,
    'formattedWithdrawalAmount',
    'Withdrawal',
  );
  const depositWidth = getReportColWidth(
    data,
    'formattedDepositAmount',
    'Deposit',
  );

  return React.useMemo(
    () => [
      {
        Header: intl.get('date'),
        accessor: 'formattedDate',
        width: 110,
        textOverview: true,
      },
      {
        Header: intl.get('description'),
        accessor: 'description',
        className: clsx(Classes.TEXT_MUTED),
        textOverview: true,
      },
      {
        Header: intl.get('payee'),
        accessor: 'payee',
        textOverview: true,
      },
      {
        Header: intl.get('recognize'),
        accessor: recognizeAccessor,
        textOverview: true,
      },
      {
        Header: intl.get('rule'),
        accessor: 'bankRuleName',
        textOverview: true,
      },
      {
        Header: intl.get('deposit'),
        accessor: 'formattedDepositAmount',
        align: 'right',
        width: depositWidth,
        money: true,
      },
      {
        Header: intl.get('withdrawal'),
        accessor: 'formattedWithdrawalAmount',
        align: 'right',
        width: withdrawalWidth,
        money: true,
      },
    ],
    [depositWidth, withdrawalWidth],
  );
}
