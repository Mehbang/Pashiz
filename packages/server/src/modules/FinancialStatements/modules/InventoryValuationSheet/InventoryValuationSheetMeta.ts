import { I18nService } from 'nestjs-i18n';
import { formatDateIn } from '@/utils/jalali-date';
import * as moment from 'moment';
import { FinancialSheetMeta } from '../../common/FinancialSheetMeta';
import {
  IInventoryValuationSheetMeta,
  IInventoryValuationReportQuery,
} from './InventoryValuationSheet.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryValuationMetaInjectable {
  constructor(
    private readonly financialSheetMeta: FinancialSheetMeta,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Retrieve the balance sheet meta.
   * @returns {Promise<IInventoryValuationSheetMeta>}
   */
  public async meta(
    query: IInventoryValuationReportQuery,
  ): Promise<IInventoryValuationSheetMeta> {
    const commonMeta = await this.financialSheetMeta.meta();
    const formattedAsDate = formatDateIn(
      query.asDate,
      commonMeta.dateFormat,
      commonMeta.calendar,
    );
    const formattedDateRange = this.i18n.t('report.as_date', {
      args: { date: formattedAsDate },
    }) as string;

    return {
      ...commonMeta,
      sheetName: 'Inventory Valuation Sheet',
      formattedAsDate,
      formattedDateRange,
    };
  }
}
