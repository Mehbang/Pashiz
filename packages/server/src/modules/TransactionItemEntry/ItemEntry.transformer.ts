import { Transformer } from '../Transformer/Transformer';
import { ItemEntry } from './models/ItemEntry';
import { convertToSecondaryUnit } from '@/modules/Items/utils/item-units';

interface ItemEntryTransformerContext {
  currencyCode: string;
}

export class ItemEntryTransformer extends Transformer<
  {},
  ItemEntryTransformerContext
> {
  /**
   * Include these attributes to item entry object.
   * @returns {Array}
   */
  public includeAttributes = (): string[] => {
    return [
      'quantityFormatted',
      'rateFormatted',
      'discountFormatted',
      'totalFormatted',
      'unitLabel',
      'secondaryUnitLabel',
      'quantityWithUnit',
      'secondaryQuantity',
      'secondaryQuantityFormatted',
      'secondaryQuantityWithUnit',
    ];
  };

  /**
   * The units this line's item is counted in, and the quantity read in each.
   *
   * The stored quantity is always in the item's primary unit; the second
   * reading is that quantity times the item's own factor. Every document that
   * has lines goes through this transformer, so an invoice, a bill and a
   * printed copy all say the same thing.
   */
  protected unitLabel = (entry: ItemEntry): string => {
    return entry.item?.unit?.symbol || entry.item?.unit?.name || '';
  };

  protected secondaryUnitLabel = (entry: ItemEntry): string => {
    return (
      entry.item?.secondaryUnit?.symbol || entry.item?.secondaryUnit?.name || ''
    );
  };

  protected quantityWithUnit = (entry: ItemEntry): string => {
    return this.withUnit(this.quantityFormatted(entry), this.unitLabel(entry));
  };

  protected secondaryQuantity = (entry: ItemEntry): number | null => {
    return convertToSecondaryUnit(entry.quantity, entry.item);
  };

  protected secondaryQuantityFormatted = (entry: ItemEntry): string => {
    const quantity = this.secondaryQuantity(entry);

    return quantity === null
      ? ''
      : this.formatNumber(quantity, { money: false });
  };

  protected secondaryQuantityWithUnit = (entry: ItemEntry): string => {
    const formatted = this.secondaryQuantityFormatted(entry);

    return formatted
      ? this.withUnit(formatted, this.secondaryUnitLabel(entry))
      : '';
  };

  private withUnit(formatted: string, unitLabel: string): string {
    return unitLabel ? `${formatted} ${unitLabel}` : formatted;
  }

  /**
   * Retrieves the formatted quantitty of item entry.
   * @param {IItemEntry} entry
   * @returns {string}
   */
  protected quantityFormatted = (entry: ItemEntry): string => {
    return this.formatNumber(entry.quantity, { money: false });
  };

  /**
   * Retrieves the formatted rate of item entry.
   * @param {IItemEntry} itemEntry -
   * @returns {string}
   */
  protected rateFormatted = (entry: ItemEntry): string => {
    return this.formatNumber(entry.rate, {
      currencyCode: this.context.currencyCode,
      money: false,
    });
  };

  /**
   * Retrieves the formatted discount amount of item entry.
   * @param {IItemEntry} entry
   * @returns {string}
   */
  protected discountFormatted = (entry: ItemEntry): string => {
    return this.formatNumber(entry.discountAmount, {
      currencyCode: this.context.currencyCode,
      excerptZero: true,
    });
  };

  /**
   * Retrieves the formatted total of item entry.
   * @param {IItemEntry} entry
   * @returns {string}
   */
  protected totalFormatted = (entry: ItemEntry): string => {
    return this.formatNumber(entry.total, {
      currencyCode: this.context.currencyCode,
      money: false,
    });
  };
}
