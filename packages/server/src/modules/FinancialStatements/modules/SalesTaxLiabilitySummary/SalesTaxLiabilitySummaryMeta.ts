import { I18nService } from 'nestjs-i18n';
import { formatDateIn } from '@/utils/jalali-date';
import { Injectable } from '@nestjs/common';
import { FinancialSheetMeta } from '../../common/FinancialSheetMeta';
import { SalesTaxLiabilitySummaryQuery } from './SalesTaxLiability.types';

@Injectable()
export class SalesTaxLiabilitySummaryMeta {
  constructor(
    private readonly financialSheetMeta: FinancialSheetMeta,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Retrieves the report meta.
   * @param {number} tenantId
   * @param {SalesTaxLiabilitySummaryQuery} filter
   */
  public async meta(query: SalesTaxLiabilitySummaryQuery) {
    const commonMeta = await this.financialSheetMeta.meta();
    const formattedToDate = formatDateIn(
      query.toDate,
      commonMeta.dateFormat,
      commonMeta.calendar,
    );
    const formattedFromDate = formatDateIn(
      query.fromDate,
      commonMeta.dateFormat,
      commonMeta.calendar,
    );
    const formattedDateRange = this.i18n.t('report.from_to', {
      args: { from: formattedFromDate, to: formattedToDate },
    }) as string;

    const sheetName = this.i18n.t('report.sheet.sales_tax_liability') as string;

    return {
      ...commonMeta,
      sheetName,
      formattedFromDate,
      formattedToDate,
      formattedDateRange,
    };
  }
}
