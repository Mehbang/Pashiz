import { describe, expect, it } from 'vitest';
import { syncSecondaryQuantity } from '../secondary-quantity';

const items = [
  { id: 1, secondary_unit_id: 2, secondary_unit_factor: 1000 }, // kg -> g
  { id: 2, secondary_unit_id: 3, secondary_unit_factor: 0.2 }, // box -> pallet
  { id: 3, secondary_unit_id: null, secondary_unit_factor: null },
];
const row = (over: Record<string, any> = {}) => [
  { itemId: 1, quantity: '', secondaryQuantity: '', ...over },
];

describe('syncSecondaryQuantity()', () => {
  it('reads the primary quantity in the second unit', () => {
    expect(
      syncSecondaryQuantity(row({ quantity: 5 }), 0, 'quantity', items)[0]
        .secondaryQuantity,
    ).toBe(5000);
  });

  it('reads a secondary quantity back into the primary', () => {
    expect(
      syncSecondaryQuantity(
        row({ secondaryQuantity: 5000 }),
        0,
        'secondaryQuantity',
        items,
      )[0].quantity,
    ).toBe(5);
  });

  it('accepts figures typed on a Persian keyboard', () => {
    expect(
      syncSecondaryQuantity(row({ quantity: '۵' }), 0, 'quantity', items)[0]
        .secondaryQuantity,
    ).toBe(5000);
  });

  it('handles a factor below one', () => {
    expect(
      syncSecondaryQuantity(
        row({ itemId: 2, quantity: 10 }),
        0,
        'quantity',
        items,
      )[0].secondaryQuantity,
    ).toBe(2);
  });

  it('converts back without a trail of decimals', () => {
    expect(
      syncSecondaryQuantity(
        row({ itemId: 2, secondaryQuantity: 2 }),
        0,
        'secondaryQuantity',
        items,
      )[0].quantity,
    ).toBe(10);
  });

  it('empties the column for an item with no second unit', () => {
    expect(
      syncSecondaryQuantity(
        row({ itemId: 3, quantity: 5, secondaryQuantity: 99 }),
        0,
        'quantity',
        items,
      )[0].secondaryQuantity,
    ).toBe('');
  });

  it('leaves other columns alone', () => {
    const before = row({ quantity: 5 });
    expect(syncSecondaryQuantity(before, 0, 'rate', items)).toBe(before);
  });
});
