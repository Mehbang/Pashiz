import intl from 'react-intl-universal';
import React from 'react';
import { useExcludedTransactionsBoot } from './ExcludedTransactionsTableBoot';
import type { DataTableColumn } from '@/components/Datatable/types';
import type { ExcludedBankTransactionsListPage } from '@bigcapital/sdk-ts';
import { CLASSES } from '@/constants';
import { getColumnWidth } from '@/utils';

export type ExcludedTransactionRow = NonNullable<
  ExcludedBankTransactionsListPage['data']
>[number] & {
  // `id` is sent by the runtime but not declared on the SDK DTO.
  id?: number;
};

const getReportColWidth = (
  data: ExcludedTransactionRow[] | undefined,
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

const descriptionAccessor = (transaction: ExcludedTransactionRow) => {
  return <span className={CLASSES.TEXT_MUTED}>{transaction.description}</span>;
};

/**
 * Retrieve excluded transactions columns table.
 */
export function useExcludedTransactionsColumns(): DataTableColumn<ExcludedTransactionRow>[] {
  const { excludedBankTransactions: data } = useExcludedTransactionsBoot();

  const withdrawalWidth = getReportColWidth(
    data ?? [],
    'formattedWithdrawalAmount',
    'Withdrawal',
  );
  const depositWidth = getReportColWidth(
    data ?? [],
    'formattedDepositAmount',
    'Deposit',
  );

  return React.useMemo(
    () => [
      {
        Header: intl.get('date'),
        accessor: 'formattedDate',
        width: 110,
      },
      {
        Header: intl.get('description'),
        accessor: descriptionAccessor,
        textOverview: true,
      },
      {
        Header: intl.get('payee'),
        accessor: 'payee',
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
