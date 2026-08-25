import { DateInput } from '@blueprintjs-formik/datetime';
import type { DateInputProps } from '@blueprintjs-formik/datetime';
import React from 'react';
import { useAppIntlContext } from '@/components/AppIntlProvider';
import { FJalaaliDateInput } from './JalaaliDateInput';

/**
 * Formik-bound date field.
 *
 * Renders the Jalaali calendar for locales that use it and Blueprint's
 * Gregorian `DateInput` everywhere else. Both variants read and write the same
 * Formik value, so call sites never need to know which one is showing.
 */
export function FDateInput(props: DateInputProps) {
  const { calendar, persianDigits } = useAppIntlContext();

  if (calendar === 'jalali') {
    return (
      <FJalaaliDateInput persianDigits={persianDigits} {...(props as any)} />
    );
  }
  return <DateInput {...props} />;
}
