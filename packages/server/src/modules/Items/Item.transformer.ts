import { Transformer } from '../Transformer/Transformer';
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
   * Two of their fields — the type label and the account normal — are i18n
   * keys, resolved by `AccountTransformer`. Running that transformer here
   * would mean building the accounts graph its `flattenName` needs, which the
   * item queries have no other reason to fetch, so only the two keys are
   * resolved.
   */
  public sellAccount(item: Item) {
    return this.translateAccountLabels(item.sellAccount);
  }

  public inventoryAccount(item: Item) {
    return this.translateAccountLabels(item.inventoryAccount);
  }

  public costAccount(item: Item) {
    return this.translateAccountLabels(item.costAccount);
  }

  private translateAccountLabels(account: any) {
    if (!account) return null;

    return {
      ...account,
      accountTypeLabel: this.context.i18n.t(account.accountTypeLabel, {
        defaultValue: account.accountTypeLabel,
      }),
      accountNormalFormatted: this.context.i18n.t(
        account.accountNormalFormatted,
        { defaultValue: account.accountNormalFormatted },
      ),
    };
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
