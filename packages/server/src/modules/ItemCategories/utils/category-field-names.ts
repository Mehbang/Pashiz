/**
 * The field definitions of a category, written as one spreadsheet cell.
 *
 * A category defines any number of fields, and a sheet has one column per
 * category — not one per field — so the whole list travels in a single cell:
 * «نویسنده، مترجم». What is written out here is what is read back in, so a
 * category exported from Pashiz can be edited and imported whole.
 */

/** Everything an organization might reasonably type between two names. */
const SEPARATORS = /[,،؛;\n]+/;

/** The names of a category's fields, in the order the category arranged them. */
export const formatCategoryFieldNames = (
  fields: Array<{ name: string }> | undefined | null,
): string => (fields ?? []).map((field) => field.name).join('، ');

/**
 * The field definitions one such cell asks for.
 *
 * A name repeated in the cell is kept once — the category cannot hold the same
 * field twice, and rejecting the whole row over a duplicated word would be a
 * poor trade. Comparison ignores case, because the unique index does too.
 */
export const parseCategoryFieldNames = (
  value: unknown,
): Array<{ name: string }> => {
  if (value === null || value === undefined) return [];

  const seen = new Set<string>();

  return String(value)
    .split(SEPARATORS)
    .map((name) => name.trim())
    .filter((name) => {
      if (!name) return false;

      const normalized = name.toLowerCase();

      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    })
    .map((name) => ({ name }));
};
