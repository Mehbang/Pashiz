import { I18nService } from 'nestjs-i18n';
import { formatDateIn } from '@/utils/jalali-date';
import { Injectable } from '@nestjs/common';
import { FinancialSheetMeta } from '../../common/FinancialSheetMeta';
import {
  ISalesByItemsReportQuery,
  ISalesByItemsSheetMeta,
} from './SalesByItems.types';

@Injectable()
export class SalesByItemsMeta {
  constructor(
    private financialSheetMeta: FinancialSheetMeta,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Retrieve the sales by items meta.
   * @returns {IBalanceSheetMeta}
   */
  public async meta(
    query: ISalesByItemsReportQuery,
  ): Promise<ISalesByItemsSheetMeta> {
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

    const sheetName = this.i18n.t('report.sheet.sales_by_items') as string;

    return {
      ...commonMeta,
      sheetName,
      formattedFromDate,
      formattedToDate,
      formattedDateRange,
    };
  }
}
