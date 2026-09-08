import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Importable } from '../Import/Importable';
import { CreateItemService } from './CreateItem.service';
import { CreateItemDto } from './dtos/Item.dto';
import { ItemsSampleData } from './Items.constants';
import { ImportableService } from '../Import/decorators/Import.decorator';
import { Item } from './models/Item';
import { parseCategoryFieldKey } from './utils/category-field-filter';

@Injectable()
@ImportableService({ name: Item.name })
export class ItemsImportable extends Importable {
  constructor(private readonly createItemService: CreateItemService) {
    super();
  }

  /**
   * Mapps the imported data to create a new item service.
   * @param {CreateItemDto} createDTO
   * @param {Knex.Transaction} trx
   * @returns {Promise<void>}
   */
  public async importable(
    createDTO: CreateItemDto,
    trx?: Knex.Transaction<any, any[]>,
  ): Promise<void> {
    await this.createItemService.createItem(createDTO, trx);
  }

  /**
   * Folds the mapped category-field columns into the item's field values.
   *
   * A sheet addresses each of those columns by the same synthetic key the
   * filter and the export use, `categoryField_<id>`, because that is what the
   * mapping screen was offered. The item itself has no such attribute — the
   * answers are rows in their own table — so they are collected here into the
   * shape the create service writes, and the flat keys are dropped before
   * validation sees them.
   *
   * An empty cell contributes nothing: an unanswered field has no row, which
   * is exactly what a blank in the sheet means.
   */
  public transform(createDTO: Record<string, any>): Record<string, any> {
    const attributes: Record<string, any> = {};
    const fieldValues: Array<{ categoryFieldId: number; value: string }> = [];

    for (const [key, value] of Object.entries(createDTO)) {
      const categoryFieldId = parseCategoryFieldKey(key);

      if (categoryFieldId === null) {
        attributes[key] = value;
        continue;
      }
      const text = value === null || value === undefined ? '' : String(value);

      if (text.trim()) {
        fieldValues.push({ categoryFieldId, value: text.trim() });
      }
    }
    return fieldValues.length > 0 ? { ...attributes, fieldValues } : attributes;
  }

  /**
   * Retrieves the sample data of customers used to download sample sheet.
   */
  public sampleData(): any[] {
    return ItemsSampleData;
  }
}
