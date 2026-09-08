import { Importable } from '../Import/Importable';
import { Knex } from 'knex';
import { ItemCategoriesSampleData } from './constants';
import { Injectable } from '@nestjs/common';
import { CreateItemCategoryDto } from './dtos/ItemCategory.dto';
import { ItemCategoryApplication } from './ItemCategory.application';
import { ImportableService } from '../Import/decorators/Import.decorator';
import { ItemCategory } from './models/ItemCategory.model';
import { parseCategoryFieldNames } from './utils/category-field-names';

@Injectable()
@ImportableService({ name: ItemCategory.name })
export class ItemCategoriesImportable extends Importable {
  constructor(private readonly itemCategoriesApp: ItemCategoryApplication) {
    super();
  }

  /**
   * Importing to create new item category service.
   * @param {CreateItemCategoryDto} createDTO
   * @param {Knex.Transaction} trx
   */
  public async importable(
    createDTO: CreateItemCategoryDto,
    trx?: Knex.Transaction,
  ) {
    await this.itemCategoriesApp.createItemCategory(createDTO, trx);
  }

  /**
   * Turns the mapped list of field names into the definitions to create.
   *
   * The sheet carries them as one comma-separated cell, which is a string and
   * has to stay one until validation has run; the create service wants a list
   * of definitions. A sheet with no such column mapped leaves the key absent,
   * and the category is created without touching its fields at all.
   */
  public transform(createDTO: Record<string, any>): Record<string, any> {
    const { fieldNames, ...attributes } = createDTO;

    if (fieldNames === undefined || fieldNames === null) return attributes;

    const fields = parseCategoryFieldNames(fieldNames);

    return fields.length > 0 ? { ...attributes, fields } : attributes;
  }

  /**
   * Item categories sample data used to download sample sheet file.
   */
  public sampleData(): any[] {
    return ItemCategoriesSampleData;
  }
}
