import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { JournalSheetService } from './JournalSheetService';
import { IJournalReportQuery, IJournalTable } from './JournalSheet.types';
import { JournalSheetTable } from './JournalSheetTable';
import { DEFAULT_REPORT_META } from '../../types/Report.types';

@Injectable()
export class JournalSheetTableInjectable {
  constructor(
    private readonly journalSheetService: JournalSheetService,
    private readonly i18nService: I18nService,
  ) {}

  /**
   * Retrieves the journal sheet in table format.
   * @param {IJournalReportQuery} query - Journal report query.
   * @returns {Promise<IJournalTable>}
   */
  public async table(query: IJournalReportQuery): Promise<IJournalTable> {
    const journal = await this.journalSheetService.journalSheet(query);
    const table = new JournalSheetTable(
      journal.data,
      journal.query,
      this.i18nService,
    );
    // Without this the table stays Gregorian and renders its figures in
    // Latin digits, whatever the organization reads in.
    table.calendar = journal.meta?.calendar || DEFAULT_REPORT_META.calendar;
    return {
      table: {
        columns: table.tableColumns(),
        rows: table.tableData(),
      },
      query: journal.query,
      meta: journal.meta,
    };
  }
}
