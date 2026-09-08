import { Injectable } from '@nestjs/common';
import { Exportable } from '../Export/Exportable';
import { ItemCategoryApplication } from './ItemCategory.application';
import { IItemCategoriesFilter } from './ItemCategory.interfaces';
import { ExportableService } from '../Export/decorators/ExportableModel.decorator';
import { ItemCategory } from './models/ItemCategory.model';
import { formatCategoryFieldNames } from './utils/category-field-names';

@Injectable()
@ExportableService({ name: ItemCategory.name })
export class ItemCategoriesExportable extends Exportable {
  constructor(private readonly itemCategoryApp: ItemCategoryApplication) {
    super();
  }

  /**
   * Retrieves the accounts data to exportable sheet.
   * @param {number} tenantId
   * @returns
   */
  public exportable(query: Partial<IItemCategoriesFilter>) {
    const parsedQuery = {
      ...query,
    } as IItemCategoriesFilter;

    return this.itemCategoryApp
      .getItemCategories(parsedQuery)
      .then((categories) => categories.map(withFieldNames));
  }
}

/**
 * Writes a category's field definitions into the single cell that carries them.
 *
 * The definitions come back as rows; a column can only read one path, so they
 * are joined into the same list the importer knows how to read back.
 */
const withFieldNames = (category: Record<string, any>) => ({
  ...category,
  fieldNames: formatCategoryFieldNames(category?.fields),
});
