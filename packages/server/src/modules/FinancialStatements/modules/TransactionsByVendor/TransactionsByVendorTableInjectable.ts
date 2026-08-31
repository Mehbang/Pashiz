import { TransactionsByVendorsTable } from './TransactionsByVendorTable';
import { ITransactionsByVendorTable } from './TransactionsByVendor.types';
import { TransactionsByVendorsInjectable } from './TransactionsByVendorInjectable';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { TransactionsByVendorQueryDto } from './TransactionsByVendorQuery.dto';
import { DEFAULT_REPORT_META } from '../../types/Report.types';

@Injectable()
export class TransactionsByVendorTableInjectable {
  constructor(
    private readonly transactionsByVendor: TransactionsByVendorsInjectable,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Retrieves the transactions by vendor in table format.
   * @param {TransactionsByVendorQueryDto} query - The filter query.
   * @returns {Promise<ITransactionsByVendorTable>}
   */
  public async table(
    query: TransactionsByVendorQueryDto,
  ): Promise<ITransactionsByVendorTable> {
    const sheet = await this.transactionsByVendor.transactionsByVendors(query);
    const table = new TransactionsByVendorsTable(
      sheet.data,
      this.i18n,
      sheet.meta.dateFormat,
      sheet.meta.calendar,
    );
    // Without this the table stays Gregorian and renders its figures in
    // Latin digits, whatever the organization reads in.
    table.calendar = sheet.meta?.calendar || DEFAULT_REPORT_META.calendar;

    return {
      table: {
        rows: table.tableRows(),
        columns: table.tableColumns(),
      },
      query,
      meta: sheet.meta,
    };
  }
}
