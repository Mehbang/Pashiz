import { ItemCategoriesImportable } from './ItemCategoriesImportable';

const importable = () => new ItemCategoriesImportable(null as any);

describe('importing a category with the fields it defines', () => {
  it('turns the mapped cell into definitions to create', () => {
    expect(
      importable().transform({ name: 'کتاب', fieldNames: 'نویسنده، مترجم' }),
    ).toEqual({
      name: 'کتاب',
      fields: [{ name: 'نویسنده' }, { name: 'مترجم' }],
    });
  });

  it('drops the flat cell, which is a string and no attribute of a category', () => {
    const transformed = importable().transform({
      name: 'کتاب',
      fieldNames: 'نویسنده',
    });
    expect(transformed.fieldNames).toBeUndefined();
  });

  it('leaves the fields alone when the sheet mapped no such column', () => {
    // Absent is not the same as empty: the sync service takes an undefined
    // list as "not my business" and an empty one as "remove them all".
    expect(importable().transform({ name: 'کتاب' })).toEqual({ name: 'کتاب' });
    expect(importable().transform({ name: 'کتاب' }).fields).toBeUndefined();
  });

  it('leaves them alone for a row whose cell is empty', () => {
    expect(importable().transform({ name: 'کتاب', fieldNames: '' })).toEqual({
      name: 'کتاب',
    });
  });
});
