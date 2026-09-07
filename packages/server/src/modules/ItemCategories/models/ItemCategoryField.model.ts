import { Model } from 'objection';
import { TenantBaseModel } from '@/modules/System/models/TenantBaseModel';

/**
 * A field a category asks its items to fill in.
 *
 * A category of books defines an author and a translator, a category of clothes
 * a size and a colour. The category owns the definition; each item carries its
 * own value for it.
 */
export class ItemCategoryField extends TenantBaseModel {
  categoryId!: number;
  name!: string;
  index!: number;

  static get tableName() {
    return 'item_category_fields';
  }

  get timestamps() {
    return ['createdAt', 'updatedAt'];
  }

  static get relationMappings() {
    const { ItemCategory } = require('../models/ItemCategory.model');
    const {
      ItemFieldValue,
    } = require('../../Items/models/ItemFieldValue.model');

    return {
      /** The category that defines this field. */
      category: {
        relation: Model.BelongsToOneRelation,
        modelClass: ItemCategory,
        join: {
          from: 'item_category_fields.categoryId',
          to: 'items_categories.id',
        },
      },

      /** What every item in the category has filled in for it. */
      values: {
        relation: Model.HasManyRelation,
        modelClass: ItemFieldValue,
        join: {
          from: 'item_category_fields.id',
          to: 'item_field_values.categoryFieldId',
        },
      },
    };
  }
}
