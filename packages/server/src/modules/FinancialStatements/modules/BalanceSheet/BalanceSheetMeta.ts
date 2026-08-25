import { I18nService } from 'nestjs-i18n';
import { formatDateIn } from '@/utils/jalali-date';
import { Injectable } from '@nestjs/common';
import { FinancialSheetMeta } from '../../common/FinancialSheetMeta';
import { IBalanceSheetMeta, IBalanceSheetQuery } from './BalanceSheet.types';

@Injectable()
export class BalanceSheetMetaInjectable {
  constructor(
    private readonly financialSheetMeta: FinancialSheetMeta,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Retrieves the balance sheet meta.
   * @returns {IBalanceSheetMeta}
   */
  public async meta(query: IBalanceSheetQuery): Promise<IBalanceSheetMeta> {
    const commonMeta = await this.financialSheetMeta.meta();
    const formattedAsDate = formatDateIn(
      query.toDate,
      commonMeta.dateFormat,
      commonMeta.calendar,
    );
    const formattedDateRange = this.i18n.t('report.as_date', {
      args: { date: formattedAsDate },
    }) as string;
    const sheetName = this.i18n.t('report.sheet.balance_sheet') as string;

    return {
      ...commonMeta,
      sheetName,
      formattedAsDate,
      formattedDateRange,
    };
  }
}
