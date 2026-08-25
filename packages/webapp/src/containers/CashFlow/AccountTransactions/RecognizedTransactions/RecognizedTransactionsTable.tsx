import intl from 'react-intl-universal';
import { Intent, Text } from '@blueprintjs/core';
import React from 'react';
import { withBankingActions } from '../../withBankingActions';
import { useAccountTransactionsContext } from '../AccountTransactionsProvider';
import { BankAccountDataTable } from '../components/BankAccountDataTable';
import { ActionsMenu } from './_components';
import { useUncategorizedTransactionsColumns } from './_utils';
import styles from './RecognizedTransactionsTable.module.scss';
import { useRecognizedTransactionsBoot } from './RecognizedTransactionsTableBoot';
import type { RecognizedTransactionRow } from './_utils';
import type { WithBankingActionsProps } from '../../withBankingActions';
import {
  TableFastCell,
  TableSkeletonRows,
  TableSkeletonHeader,
  TableVirtualizedListRows,
  AppToaster,
  Stack,
} from '@/components';
import { TABLES } from '@/constants/tables';
import { useMemorizedColumnsWidths } from '@/hooks';
import { useExcludeUncategorizedTransaction } from '@/hooks/query/banking';
import { compose } from '@/utils';

interface RecognizedTransactionsTableProps
  extends Pick<
    WithBankingActionsProps,
    'setTransactionsToCategorizeSelected'
  > {}

/**
 * Renders the recognized account transactions datatable.
 */
function RecognizedTransactionsTableRoot({
  // #withBankingActions
  setTransactionsToCategorizeSelected,
}: RecognizedTransactionsTableProps) {
  const { mutateAsync: excludeBankTransaction } =
    useExcludeUncategorizedTransaction();

  const { recognizedTransactions, isRecognizedTransactionsLoading } =
    useRecognizedTransactionsBoot();

  // Retrieve table columns.
  const columns = useUncategorizedTransactionsColumns();

  // Local storage memorizing columns widths.
  const [initialColumnsWidths, , handleColumnResizing] =
    useMemorizedColumnsWidths(TABLES.UNCATEGORIZED_ACCOUNT_TRANSACTIONS);

  const { scrollableRef } = useAccountTransactionsContext();

  // Handle cell click.
  const handleCellClick = (
    cell: { row: { original: RecognizedTransactionRow } },
    _event: React.MouseEvent,
  ) => {
    setTransactionsToCategorizeSelected([
      cell.row.original.uncategorizedTransactionId,
    ]);
  };
  // Handle exclude button click.
  const handleExcludeClick = (transaction: RecognizedTransactionRow) => {
    excludeBankTransaction(transaction.uncategorizedTransactionId)
      .then(() => {
        AppToaster.show({
          intent: Intent.SUCCESS,
          message: intl.get('the_bank_transaction_has_been_excluded'),
        });
      })
      .catch(() => {
        AppToaster.show({
          intent: Intent.DANGER,
          message: intl.get('something_wentwrong'),
        });
      });
  };

  // Handles categorize button click.
  const handleCategorizeClick = (transaction: RecognizedTransactionRow) => {
    setTransactionsToCategorizeSelected([
      transaction.uncategorizedTransactionId,
    ]);
  };

  return (
    <BankAccountDataTable
      noInitialFetch={true}
      columns={columns}
      data={recognizedTransactions}
      sticky={true}
      loading={isRecognizedTransactionsLoading}
      headerLoading={isRecognizedTransactionsLoading}
      expandColumnSpace={1}
      expandToggleColumn={2}
      selectionColumnWidth={45}
      TableCellRenderer={TableFastCell}
      TableLoadingRenderer={TableSkeletonRows}
      TableRowsRenderer={TableVirtualizedListRows}
      TableHeaderSkeletonRenderer={TableSkeletonHeader}
      ContextMenu={ActionsMenu}
      onCellClick={handleCellClick}
      // #TableVirtualizedListRows props.
      vListrowHeight={40}
      vListOverscanRowCount={0}
      initialColumnsWidths={initialColumnsWidths}
      onColumnResizing={handleColumnResizing}
      windowScrollerProps={{ scrollElement: scrollableRef }}
      noResults={<RecognizedTransactionsTableNoResults />}
      payload={{
        onExclude: handleExcludeClick,
        onCategorize: handleCategorizeClick,
      }}
    />
  );
}

export const RecognizedTransactionsTable = compose(withBankingActions)(
  RecognizedTransactionsTableRoot,
);

function RecognizedTransactionsTableNoResults() {
  return (
    <Stack spacing={12} className={styles.emptyState}>
      <Text>
        {intl.get(
          'there_are_no_recognized_transactions_due_to_one_of_the_follo',
        )}
      </Text>

      <ul>
        <li>
          {intl.get(
            'transaction_rules_have_not_yet_been_created_transactions_are',
          )}
        </li>

        <li>
          {intl.get(
            'the_transactions_in_your_bank_do_not_satisfy_the_criteria_in',
          )}
        </li>
      </ul>
    </Stack>
  );
}
