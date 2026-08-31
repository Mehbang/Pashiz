import { TenantBaseModel } from '@/modules/System/models/TenantBaseModel';

/**
 * A unit of measure the organization defines for itself.
 *
 * Deliberately not a fixed list: an organization selling cable counts metres,
 * one selling flour counts kilograms, and neither should have to pick from the
 * other's vocabulary.
 */
export class ItemUnit extends TenantBaseModel {
  name!: string;
  symbol!: string | null;
  active!: boolean;
  userId!: number;

  static get tableName() {
    return 'item_units';
  }

  get timestamps() {
    return ['createdAt', 'updatedAt'];
  }

  /**
   * What is written beside a quantity. The symbol where there is one, because
   * `12 kg` reads better than `12 کیلوگرم` in a narrow table column, and the
   * full name otherwise.
   */
  get label(): string {
    return this.symbol || this.name;
  }

  static get virtualAttributes() {
    return ['label'];
  }

  static get relationMappings() {
    const { Item } = require('../../Items/models/Item');

    return {
      /** Items counted in this unit. */
      items: {
        relation: TenantBaseModel.HasManyRelation,
        modelClass: Item,
        join: {
          from: 'item_units.id',
          to: 'items.unitId',
        },
      },
    };
  }
}
