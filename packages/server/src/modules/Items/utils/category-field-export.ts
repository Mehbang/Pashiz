import { categoryFieldKey } from './category-field-filter';

/**
 * Lays an item's category field answers out where the export columns look.
 *
 * The values arrive as a list — one row per field the item actually answered —
 * but a spreadsheet column has to read a fixed path, so they are spread into a
 * map keyed the same way the column's accessor is built. A field the item left
 * blank has no row and so no key, and its cell comes out empty.
 */
export const withCategoryFieldValues = <T extends Record<string, any>>(
  item: T,
): T & { categoryFieldValues: Record<string, string> } => {
  const values = (item?.fieldValues ?? []) as Array<{
    categoryFieldId: number;
    value?: string | null;
  }>;
  const categoryFieldValues = values.reduce(
    (acc, row) => {
      acc[categoryFieldKey(row.categoryFieldId)] = row.value ?? '';
      return acc;
    },
    {} as Record<string, string>,
  );
  return { ...item, categoryFieldValues };
};
