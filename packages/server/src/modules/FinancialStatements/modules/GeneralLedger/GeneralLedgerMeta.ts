import { I18nService } from 'nestjs-i18n';
import { formatDateIn } from '@/utils/jalali-date';
import { Injectable } from '@nestjs/common';
import {
  IGeneralLedgerMeta,
  IGeneralLedgerSheetQuery,
} from './GeneralLedger.types';
import { FinancialSheetMeta } from '../../common/FinancialSheetMeta';

@Injectable()
export class GeneralLedgerMeta {
  constructor(
    private readonly financialSheetMeta: FinancialSheetMeta,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Retrieve the general ledger meta.
   * @returns {IGeneralLedgerMeta}
   */
  public async meta(
    query: IGeneralLedgerSheetQuery,
  ): Promise<IGeneralLedgerMeta> {
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

    return {
      ...commonMeta,
      sheetName: 'Balance Sheet',
      formattedFromDate,
      formattedToDate,
      formattedDateRange,
    };
  }
}
