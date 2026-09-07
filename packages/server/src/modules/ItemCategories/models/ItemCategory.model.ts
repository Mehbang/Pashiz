import { Model } from 'objection';
import { ExportableModel } from '@/modules/Export/decorators/ExportableModel.decorator';
import { TenantBaseModel } from '@/modules/System/models/TenantBaseModel';
import { InjectModelMeta } from '@/modules/Tenancy/TenancyModels/decorators/InjectModelMeta.decorator';
import { ItemCategoryMeta } from './ItemCategory.meta';
import { ImportableModel } from '@/modules/Import/decorators/Import.decorator';

@ExportableModel()
@ImportableModel()
@InjectModelMeta(ItemCategoryMeta)
export class ItemCategory extends TenantBaseModel {
  name!: string;
  description!: string;

  costAccountId!: number;
  sellAccountId!: number;
  inventoryAccountId!: number;

  userId!: number;

  /**
   * Table name.
   */
  static get tableName() {
    return 'items_categories';
  }

  /**
   * Timestamps columns.
   */
  get timestamps() {
    return ['createdAt', 'updatedAt'];
  }

  /**
   * Relationship mapping.
   */
  static get relationMappings() {
    const { Item } = require('../../Items/models/Item');
    const { ItemCategoryField } = require('./ItemCategoryField.model');

    return {
      /**
       * The extra fields this category asks its items to fill in.
       */
      fields: {
        relation: Model.HasManyRelation,
        modelClass: ItemCategoryField,
        join: {
          from: 'items_categories.id',
          to: 'item_category_fields.categoryId',
        },
        modify: (query) => query.orderBy('index', 'asc').orderBy('id', 'asc'),
      },

      /**
       * Item category may has many items.
       */
      items: {
        relation: Model.HasManyRelation,
        modelClass: Item,
        join: {
          from: 'items_categories.id',
          to: 'items.categoryId',
        },
      },
    };
  }

  /**
   * Model modifiers.
   */
  static get modifiers() {
    return {
      /**
       * Inactive/Active mode.
       */
      sortByCount(query, order = 'asc') {
        query.orderBy('count', order);
      },
    };
  }

  /**
   * Model meta.
   */
  // static get meta() {
  // return ItemCategorySettings;
  // }
}
