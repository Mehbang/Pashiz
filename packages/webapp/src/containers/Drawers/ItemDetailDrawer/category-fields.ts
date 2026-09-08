import type { Item } from '@bigcapital/sdk-ts';

/**
 * One answered field, ready to be shown as a labelled detail.
 */
export interface ItemCategoryFieldValue {
  id: number;
  label: string;
  value: string;
}

interface FieldValueRow {
  id: number;
  value?: string | null;
  categoryField?: {
    id: number;
    name: string;
    categoryId: number;
    index?: number;
  } | null;
}

/**
 * The values an item carries for the fields its own category defines.
 *
 * An item keeps what was typed for a category it has since left — putting it
 * back restores the values — so the whole list is not what this item is now.
 * Only the current category's fields belong in a view of the current item.
 *
 * Fields left blank are not stored at all, so they simply do not appear here;
 * a read-only view gains nothing from a row of dashes.
 */
export function itemCategoryFieldValues(
  item: Item | undefined,
): ItemCategoryFieldValue[] {
  const categoryId = item?.categoryId;

  if (!item || !categoryId) return [];

  const values = ((item as Item & { fieldValues?: FieldValueRow[] })
    .fieldValues ?? []) as FieldValueRow[];

  return values
    .filter(
      (row) =>
        row.categoryField?.categoryId === categoryId &&
        Boolean(row.value?.trim()),
    )
    .sort(
      (a, b) => (a.categoryField?.index ?? 0) - (b.categoryField?.index ?? 0),
    )
    .map((row) => ({
      id: row.id,
      label: row.categoryField!.name,
      value: row.value!,
    }));
}
