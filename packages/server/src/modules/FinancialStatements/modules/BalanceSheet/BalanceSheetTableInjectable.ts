import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { BalanceSheetInjectable } from './BalanceSheetInjectable';
import { BalanceSheetTable } from './BalanceSheetTable';
import { IBalanceSheetQuery, IBalanceSheetTable } from './BalanceSheet.types';
import { DEFAULT_REPORT_META } from '../../types/Report.types';

@Injectable()
export class BalanceSheetTableInjectable {
  constructor(
    private readonly balanceSheetService: BalanceSheetInjectable,
    private readonly i18nService: I18nService,
  ) {}

  /**
   * Retrieves the balance sheet in table format.
   * @param {number} query -
   * @returns {Promise<IBalanceSheetTable>}
   */
  public async table(filter: IBalanceSheetQuery): Promise<IBalanceSheetTable> {
    const { data, query, meta } =
      await this.balanceSheetService.balanceSheet(filter);

    const table = new BalanceSheetTable(data, query, this.i18nService, meta);

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
