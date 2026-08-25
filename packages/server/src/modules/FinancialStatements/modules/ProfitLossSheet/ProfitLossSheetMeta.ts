import { I18nService } from 'nestjs-i18n';
import { formatDateIn } from '@/utils/jalali-date';
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import {
  IProfitLossSheetMeta,
  IProfitLossSheetQuery,
} from './ProfitLossSheet.types';
import { FinancialSheetMeta } from '../../common/FinancialSheetMeta';

@Injectable()
export class ProfitLossSheetMeta {
  constructor(
    private readonly financialSheetMeta: FinancialSheetMeta,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Retrieve the P/L sheet meta.
   * @param {IProfitLossSheetQuery} query - P/L sheet query.
   * @returns {Promise<IBalanceSheetMeta>}
   */
  public async meta(
    query: IProfitLossSheetQuery,
  ): Promise<IProfitLossSheetMeta> {
    const commonMeta = await this.financialSheetMeta.meta();
    const formattedToDate = formatDateIn(
      query.toDate,
      commonMeta.dateFormat,
      commonMeta.calendar,
    );
    const formattedFromDate = moment(query.fromDate).format(
      commonMeta.dateFormat,
    );
    const formattedDateRange = this.i18n.t('report.from_to', {
      args: { from: formattedFromDate, to: formattedToDate },
    }) as string;

    const sheetName = this.i18n.t('report.sheet.profit_loss') as string;

    return {
      ...commonMeta,
      sheetName,
      formattedFromDate,
      formattedToDate,
      formattedDateRange,
    };
  }
}
