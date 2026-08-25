import { FormGroup, Intent } from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { MoneyInputGroup } from '@/components';
import { CellType } from '@/constants';
import { CLASSES } from '@/constants/classes';

/**
 * Numeric input table cell.
 *
 * Built on the same input as the money and percent cells rather than
 * Blueprint's `NumericInput`: the steppers were switched off anyway, and
 * sharing the input means the quantity column reads in the locale's digits and
 * accepts them back, exactly as the rate beside it does.
 */
export default function NumericInputCell({
  row: { index },
  column: { id },
  cell: { value: initialValue },
  payload,
}: any) {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((newValue?: string) => {
    setValue(newValue ?? '');
  }, []);

  const handleBlur = () => {
    // `cleanValue()` has already normalised the digits, so this is a plain
    // Latin numeric string by the time it lands here.
    const parsed = parseFloat(value);

    payload.updateData(index, id, Number.isNaN(parsed) ? null : parsed);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const error = payload.errors?.[index]?.[id];

  return (
    <FormGroup
      intent={error ? Intent.DANGER : undefined}
      className={classNames(CLASSES.FILL)}
    >
      <MoneyInputGroup
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </FormGroup>
  );
}

NumericInputCell.cellType = CellType.Field;
