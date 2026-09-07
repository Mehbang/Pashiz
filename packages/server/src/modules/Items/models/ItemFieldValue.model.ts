import { Model } from 'objection';
import { TenantBaseModel } from '@/modules/System/models/TenantBaseModel';

/**
 * What one item has filled in for one of its category's fields.
 *
 * Every field is free text for now — the author of a book, the size of a shirt
 * — so there is a single `value` column rather than a column per type.
 */
export class ItemFieldValue extends TenantBaseModel {
  itemId!: number;
  categoryFieldId!: number;
  value!: string | null;

  static get tableName() {
    return 'item_field_values';
  }

  get timestamps() {
    return ['createdAt', 'updatedAt'];
  }

  static get relationMappings() {
    const { Item } = require('./Item');
    const {
      ItemCategoryField,
    } = require('../../ItemCategories/models/ItemCategoryField.model');

    return {
      item: {
        relation: Model.BelongsToOneRelation,
        modelClass: Item,
        join: {
          from: 'item_field_values.itemId',
          to: 'items.id',
        },
      },

      /** The definition this value answers — where its name comes from. */
      categoryField: {
        relation: Model.BelongsToOneRelation,
        modelClass: ItemCategoryField,
        join: {
          from: 'item_field_values.categoryFieldId',
          to: 'item_category_fields.id',
        },
      },
    };
  }
}
