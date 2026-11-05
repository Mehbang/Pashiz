import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { ItemFieldValue } from '../models/ItemFieldValue.model';
import { Item } from '../models/Item';
import { ItemCategoryField } from '@/modules/ItemCategories/models/ItemCategoryField.model';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';
import { ItemFieldValueDto } from '../dtos/Item.dto';

@Injectable()
export class SyncItemFieldValuesService {
  constructor(
    @Inject(ItemFieldValue.name)
    private readonly valueModel: TenantModelProxy<typeof ItemFieldValue>,

    @Inject(Item.name)
    private readonly itemModel: TenantModelProxy<typeof Item>,

    @Inject(ItemCategoryField.name)
    private readonly fieldModel: TenantModelProxy<typeof ItemCategoryField>,
  ) {}

  /**
   * Writes an item's answers to the fields its category defines.
   *
   * Only fields that actually belong to this item's own category are written.
   * The field id arrives from the request, so without this check a caller could
   * attach a value to another category's field, or to a field that does not
   * exist — which both leaks a value across categories and can trip a
   * foreign-key error that surfaces as a 500. Entries for any other field are
   * ignored rather than rejected, so a mixed import still saves what it can.
   *
   * A blank value removes the row rather than storing an empty string, so
   * "never filled in" and "cleared" look the same to everything downstream.
   */
  public async sync(
    itemId: number,
    values: ItemFieldValueDto[] | undefined,
    trx?: Knex.Transaction,
  ): Promise<void> {
    if (!values) return;

    const item = await this.itemModel().query(trx).findById(itemId);
    const categoryId = (item as any)?.categoryId ?? null;

    const validFieldIds = new Set<number>(
      categoryId
        ? (
            await this.fieldModel()
              .query(trx)
              .where('categoryId', categoryId)
              .select('id')
          ).map((row) => row.id)
        : [],
    );

    for (const entry of values) {
      if (!validFieldIds.has(entry.categoryFieldId)) continue;

      const value = entry.value?.trim() ?? '';

      const existing = await this.valueModel()
        .query(trx)
        .findOne({ itemId, categoryFieldId: entry.categoryFieldId });

      if (!value) {
        if (existing) {
          await this.valueModel().query(trx).deleteById(existing.id);
        }
        continue;
      }
      if (existing) {
        await this.valueModel().query(trx).patchAndFetchById(existing.id, {
          value,
        });
      } else {
        await this.valueModel().query(trx).insert({
          itemId,
          categoryFieldId: entry.categoryFieldId,
          value,
        });
      }
    }
  }
}
