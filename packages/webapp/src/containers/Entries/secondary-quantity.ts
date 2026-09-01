import { toLatinDigits } from '@bigcapital/utils';

/**
 * Keeps a line's two quantity columns agreeing with each other.
 *
 * An item may be counted in a primary unit and read in a second one — five
 * kilograms are five thousand grams — and the accountant should be able to
 * type whichever they have in front of them. Only the primary quantity is
 * sent: the secondary is derived, and storing both would let them disagree.
 *
 * The factor comes from the item on the row, so changing the item recomputes
 * the pair rather than leaving the previous item's arithmetic behind.
 */
interface UnitItem {
  id: number;
  secondary_unit_id?: number | null;
  secondary_unit_factor?: number | string | null;
}

const factorOf = (items: UnitItem[], itemId: unknown): number | null => {
  const item = items?.find((candidate) => candidate.id === Number(itemId));

  if (!item?.secondary_unit_id) return null;

  const factor = Number(item.secondary_unit_factor);

  return Number.isFinite(factor) && factor > 0 ? factor : null;
};

const toNumber = (value: unknown): number | null => {
  if (value === '' || value === null || value === undefined) return null;

  const parsed = Number(toLatinDigits(String(value)));

  return Number.isFinite(parsed) ? parsed : null;
};

/** Rounded so a conversion and back does not leave a trail of decimals. */
const tidy = (value: number): number => Math.round(value * 1e6) / 1e6;

export function syncSecondaryQuantity<T extends Record<string, any>>(
  rows: T[],
  rowIndex: number,
  columnId: string,
  items: UnitItem[],
): T[] {
  if (!['quantity', 'secondaryQuantity', 'itemId'].includes(columnId)) {
    return rows;
  }
  const row = rows[rowIndex];
  if (!row) return rows;

  const factor = factorOf(items, row.itemId);

  // No second unit on this item: the extra column has nothing to say.
  if (factor === null) {
    return rows.map((current, index) =>
      index === rowIndex ? { ...current, secondaryQuantity: '' } : current,
    );
  }

  const source =
    columnId === 'secondaryQuantity'
      ? toNumber(row.secondaryQuantity)
      : toNumber(row.quantity);

  if (source === null) return rows;

  const updated =
    columnId === 'secondaryQuantity'
      ? { ...row, quantity: tidy(source / factor) }
      : { ...row, secondaryQuantity: tidy(source * factor) };

  return rows.map((current, index) => (index === rowIndex ? updated : current));
}
