import { Injectable } from '@nestjs/common';
import { DATE_FORMATS } from '../Miscellaneous.constants';
import { TenancyContext } from '@/modules/Tenancy/TenancyContext.service';
import { calendarOfLanguage, formatDateIn } from '@/utils/jalali-date';

@Injectable()
export class GetDateFormatsService {
  constructor(private readonly tenancyContext: TenancyContext) {}

  /**
   * Lists the selectable date formats, each previewed with today's date in the
   * calendar the organization works in — a Persian organization should see
   * "۰۳ شهریور ۱۴۰۵", not the Gregorian equivalent.
   */
  async getDateFormats() {
    const tenantMetadata = await this.tenancyContext.getTenantMetadata();
    const calendar = calendarOfLanguage(tenantMetadata?.language);

    return DATE_FORMATS.map((dateFormat) => ({
      label: `${formatDateIn(new Date(), dateFormat, calendar)} [${dateFormat}]`,
      key: dateFormat,
    }));
  }
}
