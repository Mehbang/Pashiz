import React from 'react';
import intl from 'react-intl-universal';
import { useAppIntlContext } from '@/components/AppIntlProvider';
import { formatDateValue } from '@/utils/date-formatter';

interface FormatDateProps {
  value: string | Date | undefined | null;
  format?: string;
}

/**
 * Format the given date in the calendar of the active locale.
 */
export function FormatDate({ value, format = 'YYYY MMM DD' }: FormatDateProps) {
  const { calendar, persianDigits } = useAppIntlContext();

  // Locales may map a format onto one that reads better in their script; fall
  // back to the requested format when they don't.
  const localizedFormat = intl.get(`date_formats.${format}`) || format;

  return (
    <>{formatDateValue(value, localizedFormat, { calendar, persianDigits })}</>
  );
}

interface FormatDateCellProps {
  value: string | Date | undefined | null;
  column: { formatDate?: { format?: string } };
}

/**
 * Format date table cell.
 */
export function FormatDateCell({
  value,
  column: { formatDate },
}: FormatDateCellProps) {
  return <FormatDate value={value} {...formatDate} />;
}
