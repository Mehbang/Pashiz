import { Classes, InputGroup } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import type { Popover2Props } from '@blueprintjs/popover2';
import classNames from 'classnames';
import React from 'react';
import { JalaaliDatePicker } from './JalaaliDatePicker';

type InputGroupProps = React.ComponentProps<typeof InputGroup>;

export interface JalaaliDateInputProps {
  value?: Date | null;
  /**
   * Fired whenever the selection changes. `null` means the field was cleared.
   * The second argument matches Blueprint's `DateInput`: `true` when the change
   * came from the user rather than from a prop update.
   */
  onChange?: (date: Date | null, isUserChange: boolean) => void;
  formatDate: (date: Date) => string;
  parseDate: (value: string) => Date | null;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  /** Whether clearing the text field clears the selection. */
  canClearSelection?: boolean;
  disabled?: boolean;
  fill?: boolean;
  className?: string;
  inputProps?: InputGroupProps;
  popoverProps?: Popover2Props;
  persianDigits?: boolean;
}

/**
 * Text field with a Jalaali calendar popover, mirroring the parts of
 * Blueprint's `DateInput` that this application uses. Values in and out are
 * ordinary Gregorian `Date`s; only the rendering is Jalaali.
 */
export function JalaaliDateInput({
  value = null,
  onChange,
  formatDate,
  parseDate,
  placeholder,
  minDate,
  maxDate,
  canClearSelection = true,
  disabled,
  fill,
  className,
  inputProps,
  popoverProps,
  persianDigits = true,
}: JalaaliDateInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [text, setText] = React.useState(() =>
    value ? formatDate(value) : '',
  );

  // While the user is typing their text is authoritative; otherwise the field
  // mirrors the selected value.
  React.useEffect(() => {
    if (!isEditing) {
      setText(value ? formatDate(value) : '');
    }
  }, [value, formatDate, isEditing]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextText = event.target.value;
    setText(nextText);
    setIsOpen(true);

    if (!nextText.trim()) {
      if (canClearSelection) onChange?.(null, true);
      return;
    }
    const parsed = parseDate(nextText);

    if (parsed) onChange?.(parsed, true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Snap the text back to the selected value so a half-typed date does not
    // linger in the field.
    setText(value ? formatDate(value) : '');
  };

  const handleDayChange = (date: Date) => {
    setIsEditing(false);
    onChange?.(date, true);
    setText(formatDate(date));
    setIsOpen(false);
  };

  return (
    <Popover2
      isOpen={isOpen && !disabled}
      onInteraction={(nextOpen) => setIsOpen(nextOpen)}
      placement={'bottom-start'}
      minimal
      fill={fill}
      {...popoverProps}
      content={
        <JalaaliDatePicker
          value={value}
          onChange={handleDayChange}
          minDate={minDate}
          maxDate={maxDate}
          persianDigits={persianDigits}
        />
      }
      renderTarget={({ isOpen: _isOpen, ref, ...targetProps }) => (
        <InputGroup
          {...targetProps}
          inputRef={ref as React.Ref<HTMLInputElement>}
          className={classNames(className, { [Classes.FILL]: fill })}
          fill={fill}
          disabled={disabled}
          placeholder={placeholder}
          value={text}
          autoComplete={'off'}
          // Opening is left to Popover2's own click handling on the target:
          // toggling it from here as well would immediately undo it, since the
          // focus event fires first and the click that follows flips it back.
          onFocus={() => setIsEditing(true)}
          onChange={handleInputChange}
          onBlur={handleBlur}
          {...inputProps}
        />
      )}
    />
  );
}
