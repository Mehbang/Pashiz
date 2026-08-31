import {
  ISalesTaxLiabilitySummaryTable,
  SalesTaxLiabilitySummaryQuery,
} from './SalesTaxLiability.types';
import { SalesTaxLiabilitySummaryTable } from './SalesTaxLiabilitySummaryTable';
import { SalesTaxLiabilitySummaryService } from './SalesTaxLiabilitySummaryService';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { DEFAULT_REPORT_META } from '../../types/Report.types';

@Injectable()
export class SalesTaxLiabilitySummaryTableInjectable {
  constructor(
    private readonly salesTaxLiability: SalesTaxLiabilitySummaryService,
    private readonly i18nService: I18nService,
  ) {}

  /**
   * Retrieve sales tax liability summary table.
   * @param {SalesTaxLiabilitySummaryQuery} query
   * @returns {Promise<ISalesTaxLiabilitySummaryTable>}
   */
  public async table(
    query: SalesTaxLiabilitySummaryQuery,
  ): Promise<ISalesTaxLiabilitySummaryTable> {
    const report = await this.salesTaxLiability.salesTaxLiability(query);
    // Creates the sales tax liability summary table.
    const table = new SalesTaxLiabilitySummaryTable(
      report.data,
      query,
      this.i18nService,
    );
    // Without this the table stays Gregorian and renders its figures in
    // Latin digits, whatever the organization reads in.
    table.calendar = report.meta?.calendar || DEFAULT_REPORT_META.calendar;

    return {
      table: {
        rows: table.tableRows(),
        columns: table.tableColumns(),
      },
      query: report.query,
      meta: report.meta,
    };
  }
}
