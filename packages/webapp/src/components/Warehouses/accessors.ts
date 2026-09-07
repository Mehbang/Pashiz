import { localizedDigits } from '@/utils/locale';

/**
 * The warehouse code, read in the digits of the active locale.
 *
 * Guarded because of how the select resolves accessors: a *string* accessor
 * goes through lodash `get`, which shrugs at a missing item, but a *function*
 * accessor is called directly — and it is called with `null` for as long as
 * nothing is selected. On a new invoice that is the starting state, so an
 * unguarded read here takes the whole form down.
 *
 * Kept apart from the components so it can be tested without dragging the form
 * layer in behind it.
 */
export const warehouseCodeAccessor = (
  warehouse?: { code?: string | null } | null,
): string => localizedDigits(warehouse?.code);
