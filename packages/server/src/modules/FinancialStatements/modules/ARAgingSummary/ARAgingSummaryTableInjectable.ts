import { ARAgingSummaryTable } from './ARAgingSummaryTable';
import { ARAgingSummaryService } from './ARAgingSummaryService';
import { Injectable } from '@nestjs/common';
import { IARAgingSummaryTable } from './ARAgingSummary.types';
import { ARAgingSummaryQueryDto } from './ARAgingSummaryQuery.dto';
import { I18nService } from 'nestjs-i18n';
import { DEFAULT_REPORT_META } from '../../types/Report.types';

@Injectable()
export class ARAgingSummaryTableInjectable {
  constructor(
    private readonly ARAgingSummarySheet: ARAgingSummaryService,
    private readonly i18nService: I18nService,
  ) {}

  /**
   * Retrieves A/R aging summary in table format.
   * @param {ARAgingSummaryQueryDto} query - Aging summary query.
   * @returns {Promise<IARAgingSummaryTable>}
   */
  public async table(
    query: ARAgingSummaryQueryDto,
  ): Promise<IARAgingSummaryTable> {
    const report = await this.ARAgingSummarySheet.ARAgingSummary(query);
    const table = new ARAgingSummaryTable(report.data, query, this.i18nService);
    // Without this the table stays Gregorian and renders its figures in
    // Latin digits, whatever the organization reads in.
    table.calendar = report.meta?.calendar || DEFAULT_REPORT_META.calendar;

    return {
      table: {
        columns: table.tableColumns(),
        rows: table.tableRows(),
      },
      meta: report.meta,
      query,
    };
  }
}
