import * as R from 'ramda';
import {
  IInventoryValuationItem,
  IInventoryValuationSheetData,
  IInventoryValuationTotal,
} from './InventoryValuationSheet.types';
import { ROW_TYPE } from './_constants';
import { FinancialTable } from '../../common/FinancialTable';
import { FinancialSheetStructure } from '../../common/FinancialSheetStructure';
import { FinancialSheet } from '../../common/FinancialSheet';
import {
  ITableColumn,
  ITableColumnAccessor,
  ITableRow,
} from '../../types/Table.types';
import { tableRowMapper } from '../../utils/Table.utils';
import { INVENTORY_VALUATION_COLUMN_KEYS } from '../../common/constants/tableColumnKeys';
import { I18nService } from 'nestjs-i18n';

export class InventoryValuationSheetTable extends R.pipe(
  FinancialTable,
  FinancialSheetStructure,
)(FinancialSheet) {
  private readonly data: IInventoryValuationSheetData;

  /**
   * Constructor method.
   * @param {IInventoryValuationSheetData} data
   */
  i18n: any;

  constructor(data: IInventoryValuationSheetData, i18n: I18nService) {
    super();
    this.data = data;
    this.i18n = i18n;
  }

  /**
   * Retrieves the common columns accessors.
   * @returns {ITableColumnAccessor}
   */
  private commonColumnsAccessors(): ITableColumnAccessor[] {
    return [
      { key: INVENTORY_VALUATION_COLUMN_KEYS.ITEM_NAME, accessor: 'name' },
      {
        key: INVENTORY_VALUATION_COLUMN_KEYS.QUANTITY,
        accessor: 'quantityFormatted',
      },
      {
        key: INVENTORY_VALUATION_COLUMN_KEYS.SECONDARY_QUANTITY,
        accessor: 'secondaryQuantityFormatted',
      },
      {
        key: INVENTORY_VALUATION_COLUMN_KEYS.VALUATION,
        accessor: 'valuationFormatted',
      },
      {
        key: INVENTORY_VALUATION_COLUMN_KEYS.AVERAGE,
        accessor: 'averageFormatted',
      },
    ];
  }

  /**
   * Maps the given total node to table row.
   * @param {IInventoryValuationTotal} total
   * @returns {ITableRow}
   */
  private totalRowMapper = (total: IInventoryValuationTotal): ITableRow => {
    const accessors = this.commonColumnsAccessors();
    const meta = {
      rowTypes: [ROW_TYPE.TOTAL],
    };
    return tableRowMapper(total, accessors, meta);
  };

  /**
   * Maps the given item node to table row.
   * @param {IInventoryValuationItem} item
   * @returns {ITableRow}
   */
  private itemRowMapper = (item: IInventoryValuationItem): ITableRow => {
    const accessors = this.commonColumnsAccessors();
    const meta = {
      rowTypes: [ROW_TYPE.ITEM],
    };
    return tableRowMapper(item, accessors, meta);
  };

  /**
   * Maps the given items nodes to table rowes.
   * @param {IInventoryValuationItem[]} items
   * @returns {ITableRow[]}
   */
  private itemsRowsMapper = (items: IInventoryValuationItem[]): ITableRow[] => {
    return R.map(this.itemRowMapper)(items);
  };

  /**
   * Retrieves the table rows.
   * @returns {ITableRow[]}
   */
  public tableRows(): ITableRow[] {
    const itemsRows = this.itemsRowsMapper(this.data.items);
    const totalRow = this.totalRowMapper(this.data.total);

    return R.compose(
      R.when(R.always(R.not(R.isEmpty(itemsRows))), R.append(totalRow)),
    )([...itemsRows]) as ITableRow[];
  }

  /**
   * Retrieves the table columns.
   * @returns {ITableColumn[]}
   */
  public tableColumns(): ITableColumn[] {
    const columns = [
      {
        key: INVENTORY_VALUATION_COLUMN_KEYS.ITEM_NAME,
        label: this.i18n.t('report.column.item_name'),
      },
      {
        key: INVENTORY_VALUATION_COLUMN_KEYS.QUANTITY,
        label: this.i18n.t('report.column.quantity'),
      },
      {
        key: INVENTORY_VALUATION_COLUMN_KEYS.SECONDARY_QUANTITY,
        label: this.i18n.t('report.column.secondary_quantity'),
      },
      {
        key: INVENTORY_VALUATION_COLUMN_KEYS.VALUATION,
        label: this.i18n.t('report.column.valuation'),
      },
      {
        key: INVENTORY_VALUATION_COLUMN_KEYS.AVERAGE,
        label: this.i18n.t('report.column.average'),
      },
    ];
    return R.compose(this.tableColumnsCellIndexing)(columns);
  }
}
