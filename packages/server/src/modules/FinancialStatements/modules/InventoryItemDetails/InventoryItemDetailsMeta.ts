import { I18nService } from 'nestjs-i18n';
import { formatDateIn } from '@/utils/jalali-date';
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import {
  IInventoryDetailsQuery,
  IInventoryItemDetailMeta,
} from './InventoryItemDetails.types';
import { FinancialSheetMeta } from '../../common/FinancialSheetMeta';

@Injectable()
export class InventoryDetailsMetaInjectable {
  constructor(
    private readonly financialSheetMeta: FinancialSheetMeta,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Retrieve the inventoy details meta.
   * @returns {IInventoryItemDetailMeta}
   */
  public async meta(
    query: IInventoryDetailsQuery,
  ): Promise<IInventoryItemDetailMeta> {
    const commonMeta = await this.financialSheetMeta.meta();

    const formattedFromDate = moment(query.fromDate).format(
      commonMeta.dateFormat,
    );
    const formattedToDay = formatDateIn(
      query.toDate,
      commonMeta.dateFormat,
      commonMeta.calendar,
    );
    const formattedDateRange = this.i18n.t('report.from_to', {
      args: { from: formattedFromDate, to: formattedToDay },
    }) as string;

    const sheetName = this.i18n.t(
      'report.sheet.inventory_item_details',
    ) as string;

    return {
      ...commonMeta,
      sheetName,
      formattedFromDate,
      formattedToDay,
      formattedDateRange,
    };
  }
}
