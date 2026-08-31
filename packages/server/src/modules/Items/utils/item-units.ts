/**
 * Reading a quantity in an item's second unit.
 *
 * The factor says how many secondary units make one primary — 1000 for gram
 * against kilogram, 0.2 for pallet against box — so the conversion is a plain
 * multiplication. It lives here rather than inside a transformer because the
 * reports need it too, and two copies of a conversion is how two answers to
 * the same question start.
 */
export interface SecondaryUnitSource {
  secondaryUnitId?: number | null;
  secondaryUnitFactor?: number | string | null;
}

export const convertToSecondaryUnit = (
  quantity: unknown,
  item: SecondaryUnitSource | null | undefined,
): number | null => {
  if (quantity === null || quantity === undefined || !item) return null;
  if (!item.secondaryUnitId) return null;

  const factor = Number(item.secondaryUnitFactor);
  const amount = Number(quantity);

  if (!Number.isFinite(factor) || factor <= 0) return null;
  if (!Number.isFinite(amount)) return null;

  return amount * factor;
};
