// @ts-nocheck
import classNames from 'classnames';
import React, { useCallback } from 'react';
import { useEditableItemsEntriesColumns } from './components';
import {
  ItemEntriesTableProvider,
  useItemEntriesTableContext,
} from './ItemEntriesTableProvider';
import {
  useFetchItemRow,
  useComposeRowsOnEditTableCell,
  useComposeRowsOnRemoveTableRow,
  useComposeRowsOnNewRow,
} from './utils';
import { DataTableEditable } from '@/components';
import { CLASSES } from '@/constants/classes';
import { useUncontrolled } from '@/hooks/useUncontrolled';
import { ItemEntry } from '@/interfaces/ItemEntries';
import { syncSecondaryQuantity } from './secondary-quantity';

interface ItemsEntriesTableProps {
  initialValue?: ItemEntry;
  value?: ItemEntry[];
  onChange?: (entries: ItemEntry[]) => void;
  taxRates?: any[];
  minLinesNumber?: number;
  enableTaxRates?: boolean;
  items?: unknown[];
  itemType?: string;
  errors?: unknown;
  linesNumber?: number;
  currencyCode?: string;
  isInclusiveTax?: boolean;
  landedCost?: boolean;
}

/**
 * Items entries table.
 */
export function ItemsEntriesTable(props: ItemsEntriesTableProps) {
  const { value, initialValue, onChange } = props;

  const [localValue, handleChange] = useUncontrolled({
    value,
    initialValue,
    finalValue: [],
    onChange,
  });
  return (
    <ItemEntriesTableProvider value={{ ...props, localValue, handleChange }}>
      <ItemEntriesTableRoot />
    </ItemEntriesTableProvider>
  );
}

/**
 * Items entries table logic.
 * @returns {JSX.Element}
 */
function ItemEntriesTableRoot() {
  const {
    localValue,
    defaultEntry,
    handleChange,
    items,
    errors,
    currencyCode,
    landedCost,
    taxRates,
    itemType,
  } = useItemEntriesTableContext();

  // Editiable items entries columns.
  const columns = useEditableItemsEntriesColumns();

  const composeRowsOnEditCell = useComposeRowsOnEditTableCell();
  const composeRowsOnDeleteRow = useComposeRowsOnRemoveTableRow();
  const composeRowsOnNewRow = useComposeRowsOnNewRow();

  // Handle the fetch item row details.
  const { setItemRow, cellsLoading, isItemFetching } = useFetchItemRow({
    landedCost,
    itemType,
    notifyNewRow: (newRow, rowIndex) => {
      // Update the rate, description and quantity data of the row.
      let newRows = composeRowsOnNewRow(rowIndex, newRow, localValue);

      // The item's details arrive after it is chosen, and its factor with
      // them — so the second reading is filled in once there is something to
      // convert. Without this the column stayed blank until the quantity was
      // touched again.
      newRows = syncSecondaryQuantity(newRows, rowIndex, 'itemId', items);
      newRows = syncSecondaryQuantity(newRows, rowIndex, 'quantity', items);

      handleChange(newRows);
    },
  });
  // Handles the editor data update.
  const handleUpdateData = useCallback(
    (rowIndex, columnId, value) => {
      if (columnId === 'itemId') {
        setItemRow({ rowIndex, columnId, itemId: value });
      }
      let newRows = composeRowsOnEditCell(rowIndex, columnId, value);

      // The two quantity columns are one number read two ways. Whichever the
      // accountant fills, the other follows, and only the primary is ever sent
      // — the secondary is a convenience, not a second stored value.
      newRows = syncSecondaryQuantity(newRows, rowIndex, columnId, items);

      handleChange(newRows);
    },
    [localValue, defaultEntry, handleChange, items],
  );

  // Handle table rows removing by index.
  const handleRemoveRow = (rowIndex) => {
    const newRows = composeRowsOnDeleteRow(rowIndex);
    handleChange(newRows);
  };

  return (
    <DataTableEditable
      className={classNames(CLASSES.DATATABLE_EDITOR_ITEMS_ENTRIES)}
      columns={columns}
      data={localValue}
      sticky={true}
      progressBarLoading={isItemFetching}
      cellsLoading={isItemFetching}
      cellsLoadingCoords={cellsLoading}
      payload={{
        items,
        taxRates,
        errors: errors || [],
        updateData: handleUpdateData,
        removeRow: handleRemoveRow,
        autoFocus: ['itemId', 0],
        currencyCode,
      }}
    />
  );
}

ItemsEntriesTable.defaultProps = {
  defaultEntry: {
    index: 0,
    itemId: '',
    description: '',
    quantity: '',
    rate: '',
    discount: '',
  },
  initialEntries: [],
  taxRates: [],
  items: [],
  linesNumber: 1,
  minLinesNumber: 1,
  enableTaxRates: true,
};
