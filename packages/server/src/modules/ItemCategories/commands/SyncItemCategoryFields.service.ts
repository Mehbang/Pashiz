import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { ItemCategoryField } from '../models/ItemCategoryField.model';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';
import { ItemCategoryFieldDto } from '../dtos/ItemCategory.dto';

@Injectable()
export class SyncItemCategoryFieldsService {
  constructor(
    @Inject(ItemCategoryField.name)
    private readonly fieldModel: TenantModelProxy<typeof ItemCategoryField>,
  ) {}

  /**
   * Brings a category's field definitions in line with the given list.
   *
   * The list is the whole truth: an entry carrying an id is an existing field
   * being renamed or moved, one without is new, and a field the category had
   * that no longer appears is dropped — taking the values items held for it
   * with it, by way of the foreign key.
   *
   * Passing no list at all leaves the fields alone, so a caller that does not
   * care about them (an import, say) cannot wipe them by omission.
   */
  public async sync(
    categoryId: number,
    fields: ItemCategoryFieldDto[] | undefined,
    trx?: Knex.Transaction,
  ): Promise<void> {
    if (!fields) return;

    const existing = await this.fieldModel()
      .query(trx)
      .where('categoryId', categoryId);

    const keptIds = fields
      .map((field) => field.id)
      .filter((id): id is number => Boolean(id));

    const removed = existing.filter((field) => !keptIds.includes(field.id));

    if (removed.length > 0) {
      await this.fieldModel()
        .query(trx)
        .whereIn(
          'id',
          removed.map((field) => field.id),
        )
        .delete();
    }
    // The position in the list is the order the category arranged them in.
    for (const [index, field] of fields.entries()) {
      const name = field.name.trim();

      if (field.id && existing.some((row) => row.id === field.id)) {
        await this.fieldModel()
          .query(trx)
          .patch({ name, index })
          .where('id', field.id);
      } else {
        await this.fieldModel().query(trx).insert({ categoryId, name, index });
      }
    }
  }
}
