import { Transformer } from '../Transformer/Transformer';
import { AccountTransformer } from '../Accounts/Account.transformer';
import { Item } from './models/Item';
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
    ];
  };

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
