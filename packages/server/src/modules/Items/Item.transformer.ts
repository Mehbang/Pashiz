import { Transformer } from '../Transformer/Transformer';
import { AccountTransformer } from '../Accounts/Account.transformer';
import { Item } from './models/Item';
import { convertToSecondaryUnit } from './utils/item-units';
// import { GetItemWarehouseTransformer } from '@/services/Warehouses/Items/GettItemWarehouseTransformer';

export class ItemTransformer extends Transformer {
  /**
   * Include these attributes to sale invoice object.
   * @returns {Array}
   */
  public includeAttributes = (): string[] => {
    return [
      'typeFormatted',
      'sellPriceFormatted',
      'costPriceFormatted',
      'itemWarehouses',
      'sellAccount',
      'inventoryAccount',
      'costAccount',
      'unitLabel',
      'secondaryUnitLabel',
      'quantityOnHandFormatted',
      'secondaryQuantityOnHand',
      'secondaryQuantityOnHandFormatted',
    ];
  };

  /**
   * What is written beside a quantity of this item.
   */
  public unitLabel(item: Item): string {
    return item.unit?.symbol || item.unit?.name || '';
  }

  public secondaryUnitLabel(item: Item): string {
    return item.secondaryUnit?.symbol || item.secondaryUnit?.name || '';
  }

  public quantityOnHandFormatted(item: Item): string {
    return this.formatQuantity(item.quantityOnHand, this.unitLabel(item));
  }

  /**
   * The same stock read in the item's second unit.
   *
   * Nothing is stored in that unit — this is the stored quantity multiplied by
   * how many secondary units make one primary. An item without a second unit,
   * or without a factor, has nothing to say here.
   */
  public secondaryQuantityOnHand(item: Item): number | null {
    return convertToSecondaryUnit(item.quantityOnHand, item);
  }

  public secondaryQuantityOnHandFormatted(item: Item): string {
    const quantity = this.secondaryQuantityOnHand(item);

    return quantity === null
      ? ''
      : this.formatQuantity(quantity, this.secondaryUnitLabel(item));
  }

  private formatQuantity(quantity: unknown, unitLabel: string): string {
    if (quantity === null || quantity === undefined) return '';

    const formatted = this.formatNumber(Number(quantity), { money: false });

    return unitLabel ? `${formatted} ${unitLabel}` : formatted;
  }

  /**
   * The accounts hanging off an item.
   *
   * Serialised bare they carry i18n keys where the type label and the account
   * normal should be, so they go through the account transformer like any
   * other account. It needs no accounts graph for these — nothing here shows a
   * flattened parent chain.
   */
  public sellAccount(item: Item) {
    return item.sellAccount
      ? this.item(item.sellAccount, new AccountTransformer())
      : null;
  }

  public inventoryAccount(item: Item) {
    return item.inventoryAccount
      ? this.item(item.inventoryAccount, new AccountTransformer())
      : null;
  }

  public costAccount(item: Item) {
    return item.costAccount
      ? this.item(item.costAccount, new AccountTransformer())
      : null;
  }

  /**
   * Formatted item type.
   * @param {IItem} item
   * @returns {string}
   */
  public typeFormatted(item: Item): string {
    return this.context.i18n.t(`item.field.type.${item.type}`);
  }

  /**
   * Formatted sell price.
   * @param item
   * @returns {string}
   */
  public sellPriceFormatted(item: Item): string {
    return this.formatNumber(item.sellPrice, {
      currencyCode: this.context.organization.baseCurrency,
    });
  }

  /**
   * Formatted cost price.
   * @param item
   * @returns {string}
   */
  public costPriceFormatted(item: Item): string {
    return this.formatNumber(item.costPrice, {
      currencyCode: this.context.organization.baseCurrency,
    });
  }

  /**
   * Associate the item warehouses quantity.
   * @param item
   * @returns
   */
  // public itemWarehouses = (item) => {
  //   return this.item(
  //     item.itemWarehouses,
  //     new GetItemWarehouseTransformer(),
  //     {},
  //   );
  // };
}
