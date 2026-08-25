import { Button, Classes, HTMLSelect } from '@blueprintjs/core';
import { css } from '@emotion/css';
import classNames from 'classnames';
import React from 'react';
import {
  JALAALI_MONTHS,
  JALAALI_WEEKDAYS,
  JALAALI_WEEKDAYS_MIN,
  addJalaaliMonths,
  buildJalaaliMonthGrid,
  dateToJalaali,
  toPersianDigits,
} from '@bigcapital/utils';

/** How far the year dropdown reaches around the current Jalaali year. */
const YEARS_BEHIND = 100;
const YEARS_AHEAD = 25;

const isSameDay = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

/** Compares two dates by calendar day only, ignoring the time of day. */
const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export interface JalaaliDatePickerProps {
  /** Currently selected date, or `null` when nothing is selected. */
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  /** Render day numbers and years with Persian digit glyphs. */
  persianDigits?: boolean;
  className?: string;
}

/**
 * A Jalaali (Solar Hijri) month grid, laid out Saturday-first the way Persian
 * calendars are read. The value it emits is an ordinary Gregorian `Date` — the
 * Jalaali calendar exists only in what the user sees.
 */
export function JalaaliDatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  persianDigits = true,
  className,
}: JalaaliDatePickerProps) {
  const today = React.useMemo(() => new Date(), []);
  const todayJalaali = React.useMemo(() => dateToJalaali(today), [today]);

  // The month on display, which follows the selection but can be browsed away
  // from it.
  const [visible, setVisible] = React.useState(() =>
    value ? dateToJalaali(value) : todayJalaali,
  );

  React.useEffect(() => {
    if (value) {
      const { jy, jm } = dateToJalaali(value);
      setVisible((current) =>
        current.jy === jy && current.jm === jm ? current : { jy, jm, jd: 1 },
      );
    }
  }, [value]);

  const weeks = React.useMemo(
    () => buildJalaaliMonthGrid(visible.jy, visible.jm),
    [visible.jy, visible.jm],
  );

  const years = React.useMemo(() => {
    const first = todayJalaali.jy - YEARS_BEHIND;

    return Array.from(
      { length: YEARS_BEHIND + YEARS_AHEAD + 1 },
      (_, index) => first + index,
    );
  }, [todayJalaali.jy]);

  const digits = (input: number | string) =>
    persianDigits ? toPersianDigits(input) : String(input);

  const isOutOfRange = (date: Date): boolean =>
    (minDate !== undefined && startOfDay(date) < startOfDay(minDate)) ||
    (maxDate !== undefined && startOfDay(date) > startOfDay(maxDate));

  const stepMonth = (delta: number) =>
    setVisible((current) => ({
      ...addJalaaliMonths(current.jy, current.jm, delta),
      jd: 1,
    }));

  return (
    <div className={classNames(pickerStyle, className)} dir={'rtl'}>
      <div className={'jalaali-datepicker__header'}>
        {/* In a right-to-left calendar the previous month sits to the right. */}
        <Button
          minimal
          icon={'chevron-right'}
          aria-label={'ماه قبل'}
          onClick={() => stepMonth(-1)}
        />
        <HTMLSelect
          minimal
          value={visible.jm}
          onChange={(event) =>
            setVisible((current) => ({
              ...current,
              jm: Number(event.currentTarget.value),
            }))
          }
        >
          {JALAALI_MONTHS.map((month, index) => (
            <option key={month} value={index + 1}>
              {month}
            </option>
          ))}
        </HTMLSelect>
        <HTMLSelect
          minimal
          value={visible.jy}
          onChange={(event) =>
            setVisible((current) => ({
              ...current,
              jy: Number(event.currentTarget.value),
            }))
          }
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {digits(year)}
            </option>
          ))}
        </HTMLSelect>
        <Button
          minimal
          icon={'chevron-left'}
          aria-label={'ماه بعد'}
          onClick={() => stepMonth(1)}
        />
      </div>

      <table className={'jalaali-datepicker__grid'}>
        <thead>
          <tr>
            {JALAALI_WEEKDAYS_MIN.map((weekday, index) => (
              <th key={weekday} scope={'col'} abbr={JALAALI_WEEKDAYS[index]}>
                {weekday}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((cell, cellIndex) => {
                if (!cell) return <td key={cellIndex} />;

                const disabled = isOutOfRange(cell.date);
                const selected = !!value && isSameDay(cell.date, value);

                return (
                  <td key={cellIndex}>
                    <button
                      type={'button'}
                      disabled={disabled}
                      aria-current={selected ? 'date' : undefined}
                      className={classNames('jalaali-datepicker__day', {
                        'is-selected': selected,
                        'is-today': isSameDay(cell.date, today),
                        [Classes.DISABLED]: disabled,
                      })}
                      onClick={() => onChange(cell.date)}
                    >
                      {digits(cell.jd)}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className={'jalaali-datepicker__footer'}>
        <Button
          minimal
          small
          disabled={isOutOfRange(today)}
          onClick={() => onChange(today)}
        >
          امروز
        </Button>
      </div>
    </div>
  );
}

const pickerStyle = css`
  padding: 6px;
  /* A definite width, like Blueprint's own DatePicker: without it the calendar
     stretches to fill a popover that call sites open with fill enabled. */
  width: 244px;

  .jalaali-datepicker__header {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-bottom: 4px;

    select {
      font-size: 13px;
    }
    > .${Classes.BUTTON}:last-child {
      margin-inline-start: auto;
    }
  }

  .jalaali-datepicker__grid {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;

    th {
      font-size: 11px;
      font-weight: 600;
      opacity: 0.6;
      padding-bottom: 4px;
      text-align: center;
    }
    td {
      padding: 1px;
      text-align: center;
    }
  }

  .jalaali-datepicker__day {
    appearance: none;
    background: none;
    border: 0;
    border-radius: 3px;
    cursor: pointer;
    font-size: 13px;
    line-height: 1;
    padding: 6px 0;
    width: 100%;

    &:hover:not(:disabled) {
      background: rgba(167, 182, 194, 0.3);
    }
    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
    &.is-today {
      font-weight: 700;
      box-shadow: inset 0 0 0 1px rgba(138, 155, 168, 0.6);
    }
    &.is-selected {
      background: #2d72d2;
      color: #fff;

      &:hover {
        background: #2d72d2;
      }
    }
  }

  .jalaali-datepicker__footer {
    display: flex;
    justify-content: center;
    margin-top: 4px;
  }
`;
