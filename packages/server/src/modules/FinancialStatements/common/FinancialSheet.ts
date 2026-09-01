import * as moment from 'moment';
import {
  IFormatNumberSettings,
  INumberFormatQuery,
} from '../types/Report.types';
import { formatNumber } from '@/utils/format-number';
import { CalendarSystem, formatDateIn } from '@/utils/jalali-date';
import { toPersianDigits } from '@bigcapital/utils';
import { convertToSecondaryUnit } from '@/modules/Items/utils/item-units';
import { IFinancialTableTotal } from '../types/Table.types';

export class FinancialSheet {
  public numberFormat: INumberFormatQuery = {
    precision: 2,
    divideOn1000: false,
    showZero: false,
    formatMoney: 'total',
    negativeFormat: 'mines',
  };
  public baseCurrency: string;
  public dateFormat: string = 'YYYY MMM DD';
  /** Calendar the sheet's displayed dates and period boundaries follow. */
  public calendar: CalendarSystem = 'gregorian';

  /**
   * Whether the sheet's amounts are rendered with Persian digits. Follows the
   * calendar: an organization reading its dates in Jalaali reads its numbers in
   * Persian digits too.
   */
  protected get persianDigits(): boolean {
    return this.calendar === 'jalali';
  }

  /**
   * Transformes the number format query to settings
   */
  protected transfromFormatQueryToSettings(): IFormatNumberSettings {
    const { numberFormat } = this;

    return {
      precision: numberFormat.precision,
      divideOn1000: numberFormat.divideOn1000,
      excerptZero: !numberFormat.showZero,
      negativeFormat: numberFormat.negativeFormat,
      money: numberFormat.formatMoney === 'always',
      currencyCode: this.baseCurrency,
      persianDigits: this.persianDigits,
    };
  }

  /**
   * Formating amount based on the given report query.
   * @param  {number} number -
   * @param  {IFormatNumberSettings} overrideSettings -
   * @return {string}
   */
  protected formatNumber(
    number,
    overrideSettings: IFormatNumberSettings = {},
  ): string {
    const settings = {
      ...this.transfromFormatQueryToSettings(),
      ...overrideSettings,
    };
    return formatNumber(number, settings);
  }

  /**
   * Formatting full amount with different format settings.
   * @param {number} amount -
   * @param {IFormatNumberSettings} settings -
   */
  protected formatTotalNumber = (
    amount: number,
    settings: IFormatNumberSettings = {},
  ): string => {
    const { numberFormat } = this;

    return this.formatNumber(amount, {
      money: numberFormat.formatMoney === 'none' ? false : true,
      excerptZero: false,
      ...settings,
    });
  };

  /**
   * Formates the amount to the percentage string.
   * @param   {number} amount
   * @returns {string}
   */
  protected formatPercentage = (
    amount: number,
    overrideSettings: IFormatNumberSettings = {},
  ): string => {
    const percentage = amount * 100;
    const settings = {
      excerptZero: true,
      persianDigits: this.persianDigits,
      ...overrideSettings,
      symbol: '%',
      money: false,
    };
    return formatNumber(percentage, settings);
  };

  /**
   * Format the given total percentage.
   * @param {number} amount -
   * @param {IFormatNumberSettings} settings -
   */
  protected formatTotalPercentage = (
    amount: number,
    settings: IFormatNumberSettings = {},
  ): string => {
    return this.formatPercentage(amount, {
      ...settings,
      excerptZero: false,
    });
  };

  /**
   * Retrieve the amount meta object.
   * @param {number} amount
   * @returns {ICashFlowStatementTotal}
   */
  protected getAmountMeta(
    amount: number,
    overrideSettings?: IFormatNumberSettings,
  ): IFinancialTableTotal {
    return {
      amount,
      formattedAmount: this.formatNumber(amount, overrideSettings),
      currencyCode: this.baseCurrency,
    };
  }

  /**
   * Retrieve the total amount meta object.
   * @param {number} amount
   * @returns {ICashFlowStatementTotal}
   */
  protected getTotalAmountMeta(
    amount: number,
    title?: string,
  ): IFinancialTableTotal {
    return {
      ...(title ? { title } : {}),
      amount,
      formattedAmount: this.formatTotalNumber(amount),
      currencyCode: this.baseCurrency,
    };
  }

  /**
   * Retrieve the date meta.
   * @param {Date} date
   * @param {string} format
   * @returns
   */
  protected getDateMeta(date: moment.MomentInput, format?: string) {
    const dateFormat = format || this.dateFormat || 'YYYY MMM DD';
    return {
      formattedDate: formatDateIn(date, dateFormat, this.calendar),
      date: moment(date).toDate(),
    };
  }

  /**
   * Digits in a label the number formatter never sees — a day count in a
   * column heading, an index. Amounts go through `formatNumber`, which does
   * this already.
   */
  /**
   * A quantity written with the unit the item is counted in, and the same
   * amount read in its second unit where it has one.
   *
   * The conversion is the documents' own — there is one answer to how many
   * grams a kilogram of this item is, and it lives in `item-units`.
   */
  protected withUnit(
    formatted: string,
    unit?: { symbol?: string | null; name?: string | null } | null,
  ): string {
    const label = unit?.symbol || unit?.name || '';

    return label ? `${formatted} ${label}` : formatted;
  }

  protected secondaryQuantityFormatted(
    quantity: unknown,
    item:
      | {
          secondaryUnit?: {
            symbol?: string | null;
            name?: string | null;
          } | null;
          secondaryUnitId?: number | null;
          secondaryUnitFactor?: number | string | null;
        }
      | null
      | undefined,
  ): string {
    const converted = convertToSecondaryUnit(quantity, item);

    if (converted === null) return '';

    return this.withUnit(
      this.formatNumber(converted, { money: false }),
      item?.secondaryUnit,
    );
  }

  protected localizeDigits(text: string): string {
    return this.persianDigits ? toPersianDigits(text) : text;
  }

  protected getDateFormatted(date: moment.MomentInput, format?: string) {
    const dateFormat = format || this.dateFormat || 'YYYY MMM DD';
    return formatDateIn(date, dateFormat, this.calendar);
  }

  getPercentageBasis = (base, amount) => {
    return base ? amount / base : 0;
  };

  getAmountChange = (base, amount) => {
    return base - amount;
  };

  protected getPercentageAmountMeta = (amount) => {
    const formattedAmount = this.formatPercentage(amount);

    return {
      amount,
      formattedAmount,
    };
  };

  /**
   * Re
   * @param {number} amount
   * @returns
   */
  protected getPercentageTotalAmountMeta = (amount: number) => {
    const formattedAmount = this.formatTotalPercentage(amount);

    return { amount, formattedAmount };
  };
}
