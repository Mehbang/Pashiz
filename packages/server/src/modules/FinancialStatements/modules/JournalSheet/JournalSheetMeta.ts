import { formatDateIn } from '@/utils/jalali-date';
import { I18nService } from 'nestjs-i18n';
import * as moment from 'moment';
import { Injectable } from '@nestjs/common';
import { FinancialSheetMeta } from '../../common/FinancialSheetMeta';
import { IJournalReportQuery, IJournalSheetMeta } from './JournalSheet.types';

@Injectable()
export class JournalSheetMeta {
  constructor(
    private readonly financialSheetMeta: FinancialSheetMeta,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Retrieves the journal sheet meta.
   * @param {IJournalReportQuery} query -
   * @returns {Promise<IJournalSheetMeta>}
   */
  public async meta(query: IJournalReportQuery): Promise<IJournalSheetMeta> {
    const common = await this.financialSheetMeta.meta();

    const formattedToDate = formatDateIn(
      query.toDate,
      common.dateFormat,
      common.calendar,
    );
    const formattedFromDate = formatDateIn(
      query.fromDate,
      common.dateFormat,
      common.calendar,
    );
    const formattedDateRange = this.i18n.t('report.from_to', {
      args: { from: formattedFromDate, to: formattedToDate },
    }) as string;

    return {
      ...common,
      formattedDateRange,
      formattedFromDate,
      formattedToDate,
    };
  }
}
