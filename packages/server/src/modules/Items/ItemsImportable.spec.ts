import { ItemsImportable } from './ItemsImportable.service';

/**
 * The importable only needs its create service to import; the transform under
 * test never touches it.
 */
const importable = () => new ItemsImportable(null as any);

describe('importing the fields a category defines', () => {
  it('folds the mapped columns into the values the item carries', () => {
    expect(
      importable().transform({
        name: 'کلیدر',
        categoryField_3: 'محمود دولت‌آبادی',
        categoryField_4: '—',
      }),
    ).toEqual({
      name: 'کلیدر',
      fieldValues: [
        { categoryFieldId: 3, value: 'محمود دولت‌آبادی' },
        { categoryFieldId: 4, value: '—' },
      ],
    });
  });

  it('accepts the spelling the mapping screen sends back', () => {
    // The meta endpoint snake-cases its keys on the way out, so a column the
    // interface mapped arrives as `category_field_3`.
    expect(importable().transform({ category_field_3: 'نیما' })).toEqual({
      fieldValues: [{ categoryFieldId: 3, value: 'نیما' }],
    });
  });

  it('leaves the item attributes alone', () => {
    // The flat keys have to be gone before validation runs: the item itself
    // has no such attribute.
    const transformed = importable().transform({
      name: 'کلیدر',
      sellPrice: 120000,
      categoryField_3: 'دولت‌آبادی',
    });
    expect(transformed.categoryField_3).toBeUndefined();
    expect(transformed.sellPrice).toEqual(120000);
  });

  it('reads a blank cell as an unanswered field, not an empty answer', () => {
    expect(
      importable().transform({ name: 'کلیدر', categoryField_3: '   ' }),
    ).toEqual({ name: 'کلیدر' });
  });

  it('carries a number typed into a text field across as written', () => {
    expect(importable().transform({ categoryField_9: 1357 })).toEqual({
      fieldValues: [{ categoryFieldId: 9, value: '1357' }],
    });
  });

  it('adds nothing to a sheet that mapped no such column', () => {
    expect(importable().transform({ name: 'میز' })).toEqual({ name: 'میز' });
  });
});
