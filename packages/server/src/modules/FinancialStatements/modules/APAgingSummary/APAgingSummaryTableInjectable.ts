import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { IAPAgingSummaryTable } from './APAgingSummary.types';
import { APAgingSummaryService } from './APAgingSummaryService';
import { APAgingSummaryTable } from './APAgingSummaryTable';
import { APAgingSummaryQueryDto } from './APAgingSummaryQuery.dto';
import { DEFAULT_REPORT_META } from '../../types/Report.types';

@Injectable()
export class APAgingSummaryTableInjectable {
  constructor(
    private readonly APAgingSummarySheet: APAgingSummaryService,
    private readonly i18nService: I18nService,
  ) {}

  /**
   * Retrieves A/P aging summary in table format.
   * @param {APAgingSummaryQueryDto} query -
   * @returns {Promise<IAPAgingSummaryTable>}
   */
  public async table(
    query: APAgingSummaryQueryDto,
  ): Promise<IAPAgingSummaryTable> {
    const report = await this.APAgingSummarySheet.APAgingSummary(query);
    const table = new APAgingSummaryTable(report.data, query, this.i18nService);
    // Without this the table stays Gregorian and renders its figures in
    // Latin digits, whatever the organization reads in.
    table.calendar = report.meta?.calendar || DEFAULT_REPORT_META.calendar;

    return {
      table: {
        columns: table.tableColumns(),
        rows: table.tableRows(),
      },
      meta: report.meta,
      query: report.query,
    };
  }
}
