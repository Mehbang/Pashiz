import { I18nService } from 'nestjs-i18n';
import { formatDateIn } from '@/utils/jalali-date';
import * as moment from 'moment';
import { Injectable } from '@nestjs/common';
import { FinancialSheetMeta } from '../../common/FinancialSheetMeta';
import {
  IPurchasesByItemsReportQuery,
  IPurchasesByItemsSheetMeta,
} from './types/PurchasesByItems.types';

@Injectable()
export class PurchasesByItemsMeta {
  constructor(
    private financialSheetMetaModel: FinancialSheetMeta,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Retrieve the purchases by items meta.
   * @param {IPurchasesByItemsReportQuery} query
   * @returns {IPurchasesByItemsSheetMeta}
   */
  public async meta(
    query: IPurchasesByItemsReportQuery,
  ): Promise<IPurchasesByItemsSheetMeta> {
    const commonMeta = await this.financialSheetMetaModel.meta();
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

    return {
      ...commonMeta,
      sheetName: 'Purchases By Items',
      formattedFromDate,
      formattedToDate,
      formattedDateRange,
    };
  }
}
