import { I18nService } from 'nestjs-i18n';
import { formatDateIn } from '@/utils/jalali-date';
import { Injectable } from '@nestjs/common';
import { FinancialSheetMeta } from '../../common/FinancialSheetMeta';
import { IAgingSummaryMeta, IAgingSummaryQuery } from './AgingSummary.types';

@Injectable()
export class AgingSummaryMeta {
  constructor(
    private readonly financialSheetMeta: FinancialSheetMeta,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Retrieve the aging summary meta.
   * @returns {IBalanceSheetMeta}
   */
  public async meta(query: IAgingSummaryQuery): Promise<IAgingSummaryMeta> {
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
      sheetName: 'A/P Aging Summary',
      formattedAsDate,
      formattedDateRange,
    };
  }
}
