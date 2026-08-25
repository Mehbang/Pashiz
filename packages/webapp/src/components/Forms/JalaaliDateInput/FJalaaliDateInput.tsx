import { Intent } from '@blueprintjs/core';
import { Field, getIn } from 'formik';
import type { FieldProps } from 'formik';
import React from 'react';
import { JalaaliDateInput } from './JalaaliDateInput';
import type { JalaaliDateInputProps } from './JalaaliDateInput';

/**
 * How the selected date is stored in the Formik value. Kept identical to
 * `@blueprintjs-formik/datetime` so switching calendars never changes what the
 * form holds or what the API receives.
 */
const defaultFormFormatDate = (date: Date): string => date.toISOString();
const defaultFormParseDate = (value: string): Date | null =>
  value ? new Date(value) : null;

export interface FJalaaliDateInputProps
  extends Omit<JalaaliDateInputProps, 'value' | 'onChange'> {
  name: string;
  formFormatDate?: (date: Date) => string;
  formParseDate?: (value: string) => Date | null;
  /** Accepted for parity with the other Formik fields; see the note below. */
  fastField?: boolean;
  shouldUpdateDeps?: Record<string, unknown>;
}

function FieldToJalaaliDateInput({
  field: { onBlur: _fieldOnBlur, ...field },
  form: { touched, errors, ...form },
  meta: _meta,
  formFormatDate = defaultFormFormatDate,
  formParseDate = defaultFormParseDate,
  fastField: _fastField,
  shouldUpdateDeps: _shouldUpdateDeps,
  inputProps,
  ...props
}: FieldProps & Omit<FJalaaliDateInputProps, 'form'>) {
  const fieldError = getIn(errors, field.name);
  const showError = getIn(touched, field.name) && !!fieldError;

  const handleChange = (selectedDate: Date | null) => {
    form.setFieldValue(
      field.name,
      selectedDate ? formFormatDate(selectedDate) : '',
    );
  };

  return (
    <JalaaliDateInput
      {...props}
      value={formParseDate(field.value)}
      onChange={handleChange}
      inputProps={{
        intent: showError ? Intent.DANGER : Intent.NONE,
        id: field.name,
        name: field.name,
        ...inputProps,
      }}
    />
  );
}

/**
 * Jalaali date input bound to Formik. Drop-in replacement for the Gregorian
 * `FDateInput`; `FDateInput` picks between them based on the active locale.
 *
 * Note: like `@blueprintjs-formik/datetime`, this renders a plain Formik
 * `Field` — `fastField` is accepted and ignored so both calendars re-render
 * identically.
 */
export function FJalaaliDateInput(props: FJalaaliDateInputProps) {
  return <Field {...props} component={FieldToJalaaliDateInput} />;
}
