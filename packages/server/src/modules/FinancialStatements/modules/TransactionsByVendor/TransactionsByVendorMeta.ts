import { I18nService } from 'nestjs-i18n';
import { formatDateIn } from '@/utils/jalali-date';
import {
  ITransactionsByVendorMeta,
  ITransactionsByVendorsFilter,
} from './TransactionsByVendor.types';
import { Injectable } from '@nestjs/common';
import { FinancialSheetMeta } from '../../common/FinancialSheetMeta';

@Injectable()
export class TransactionsByVendorMeta {
  constructor(
    private readonly financialSheetMeta: FinancialSheetMeta,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Retrieves the transactions by vendor meta.
   * @returns {Promise<ITransactionsByVendorMeta>}
   */
  public async meta(
    query: ITransactionsByVendorsFilter,
  ): Promise<ITransactionsByVendorMeta> {
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

    const sheetName = this.i18n.t(
      'report.sheet.transactions_by_vendor',
    ) as string;

    return {
      ...commonMeta,
      sheetName,
      formattedFromDate,
      formattedToDate,
      formattedDateRange,
    };
  }
}
