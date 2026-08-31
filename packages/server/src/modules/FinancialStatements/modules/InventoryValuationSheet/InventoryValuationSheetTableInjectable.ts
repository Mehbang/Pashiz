import { InventoryValuationSheetService } from './InventoryValuationSheetService';
import {
  IInventoryValuationReportQuery,
  IInventoryValuationTable,
} from './InventoryValuationSheet.types';
import { InventoryValuationSheetTable } from './InventoryValuationSheetTable';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { DEFAULT_REPORT_META } from '../../types/Report.types';

@Injectable()
export class InventoryValuationSheetTableInjectable {
  constructor(
    private readonly sheet: InventoryValuationSheetService,
    private readonly i18nService: I18nService,
  ) {}

  /**
   * Retrieves the inventory valuation json table format.
   * @param {IInventoryValuationReportQuery} filter -
   * @returns {Promise<IInventoryValuationTable>}
   */
  public async table(
    filter: IInventoryValuationReportQuery,
  ): Promise<IInventoryValuationTable> {
    const { data, query, meta } =
      await this.sheet.inventoryValuationSheet(filter);
    const table = new InventoryValuationSheetTable(data, this.i18nService);
    // Without this the table stays Gregorian and renders its figures in
    // Latin digits, whatever the organization reads in.
    table.calendar = meta?.calendar || DEFAULT_REPORT_META.calendar;

    return {
      table: {
        columns: table.tableColumns(),
        rows: table.tableRows(),
      },
      query,
      meta,
    };
  }
}
