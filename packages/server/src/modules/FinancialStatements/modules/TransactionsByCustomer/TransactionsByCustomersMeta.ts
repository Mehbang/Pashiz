import { I18nService } from 'nestjs-i18n';
import { formatDateIn } from '@/utils/jalali-date';
import * as moment from 'moment';
import { Injectable } from '@nestjs/common';
import { FinancialSheetMeta } from '../../common/FinancialSheetMeta';
import {
  ITransactionsByCustomersFilter,
  ITransactionsByCustomersMeta,
} from './TransactionsByCustomer.types';

@Injectable()
export class TransactionsByCustomersMeta {
  constructor(
    private readonly financialSheetMeta: FinancialSheetMeta,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Retrieves the transactions by customers meta.
   * @param {ITransactionsByCustomersFilter} query - Transactions by customers filter.
   * @returns {ITransactionsByCustomersMeta}
   */
  public async meta(
    query: ITransactionsByCustomersFilter,
  ): Promise<ITransactionsByCustomersMeta> {
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

    return {
      ...commonMeta,
      sheetName: 'Transactions By Customers',
      formattedFromDate,
      formattedToDate,
      formattedDateRange,
    };
  }
}
