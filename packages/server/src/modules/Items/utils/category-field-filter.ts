/**
 * Filtering items by the fields their category defines.
 *
 * These fields are not columns and are not known at compile time — an
 * organization invents them — so they cannot sit in the item's static meta
 * alongside `name` and `code`. Instead each one is addressed by a synthetic
 * key, `categoryField_<id>`, which the item model resolves on demand into an
 * ordinary text field carrying its own query.
 */

/** The synthetic filter key for one category field. */
export const categoryFieldKey = (fieldId: number): string =>
  `categoryField_${fieldId}`;

/**
 * The field id behind such a key, or null if the key is an ordinary one.
 *
 * Both spellings are accepted. The meta endpoint snake-cases its keys on the
 * way out, so the interface reads `category_field_1` and sends that straight
 * back — while the key is minted here as `categoryField_1`. Matching only the
 * minted form means every filter the interface actually builds is rejected.
 */
export const parseCategoryFieldKey = (key: string): number | null => {
  const match = /^category_?[Ff]ield_(\d+)$/.exec(key);

  return match ? Number(match[1]) : null;
};

type Role = { comparator?: string; value?: unknown };

/**
 * Whether the comparator asks for the absence of a match.
 *
 * Negation cannot be expressed by negating the inner condition: an item with no
 * value at all for the field has no row to fail the test, and would be dropped
 * from "does not contain" results even though it plainly does not contain it.
 * So the whole existence check is negated instead.
 */
const isNegated = (comparator?: string): boolean =>
  ['not_equal', 'not_equals', 'is_not', 'not_contain', 'not_contains'].includes(
    (comparator ?? '').toLowerCase(),
  );

const applyComparator = (builder, comparator: string, value: string) => {
  const column = 'item_field_values.value';

  switch ((comparator ?? '').toLowerCase()) {
    case 'contain':
    case 'contains':
    case 'not_contain':
    case 'not_contains':
      return builder.where(column, 'LIKE', `%${value}%`);
    case 'starts_with':
    case 'start_with':
      return builder.where(column, 'LIKE', `${value}%`);
    case 'ends_with':
    case 'end_with':
      return builder.where(column, 'LIKE', `%${value}`);
    default:
      return builder.where(column, value);
  }
};

/**
 * The query one such filter contributes: items holding a matching value for
 * this particular field.
 */
export const categoryFieldFilterQuery =
  (fieldId: number) => (builder, role: Role) => {
    const value = String(role?.value ?? '');
    const comparator = role?.comparator ?? 'contains';

    const exists = (qb) => {
      qb.select('*')
        .from('item_field_values')
        // Raw, so it escapes the snake-case mapper that upper-cases every
        // other identifier in the query. Written the way the mapper would
        // write it, or MySQL cannot find the column.
        .whereRaw('`ITEM_FIELD_VALUES`.`ITEM_ID` = `ITEMS`.`ID`')
        .where('item_field_values.category_field_id', fieldId);

      applyComparator(qb, comparator, value);
    };

    if (isNegated(comparator)) {
      builder.whereNotExists(exists);
    } else {
      builder.whereExists(exists);
    }
  };
