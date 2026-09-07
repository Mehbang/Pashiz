import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { ItemFieldValue } from '../models/ItemFieldValue.model';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';
import { ItemFieldValueDto } from '../dtos/Item.dto';

@Injectable()
export class SyncItemFieldValuesService {
  constructor(
    @Inject(ItemFieldValue.name)
    private readonly valueModel: TenantModelProxy<typeof ItemFieldValue>,
  ) {}

  /**
   * Writes an item's answers to the fields its category defines.
   *
   * Only the fields named in the list are touched. Values for a category the
   * item has since left are left where they are: putting the item back restores
   * what was typed, and a category change is not a reason to lose it.
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

    for (const entry of values) {
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
