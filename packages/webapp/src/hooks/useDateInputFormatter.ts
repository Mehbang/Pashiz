import { useMemo } from 'react';
import { useAppIntlContext } from '@/components/AppIntlProvider';
import { useCurrentOrganizationMetadata } from '@/hooks/query';
import { dateFormatter } from '@/utils/date-formatter';

const DEFAULT_DATE_FORMAT = 'DD MMM YYYY';

/**
 * Returns the formatter props (`formatDate`, `parseDate`, `placeholder`) for
 * date inputs based on the current organization's configured date format and
 * the calendar of the active locale (Jalaali for Persian, Gregorian otherwise).
 */
export function useDateInputFormatter() {
  const metadata = useCurrentOrganizationMetadata();
  const { calendar, persianDigits } = useAppIntlContext();
  const dateFormat = metadata?.dateFormat ?? DEFAULT_DATE_FORMAT;

  return useMemo(
    () => dateFormatter(dateFormat, { calendar, persianDigits }),
    [dateFormat, calendar, persianDigits],
  );
}
