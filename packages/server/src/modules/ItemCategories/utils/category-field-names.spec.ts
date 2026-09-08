import {
  formatCategoryFieldNames,
  parseCategoryFieldNames,
} from './category-field-names';

describe('category field names in a spreadsheet cell', () => {
  it('writes the definitions in the order the category arranged them', () => {
    expect(
      formatCategoryFieldNames([{ name: 'نویسنده' }, { name: 'مترجم' }]),
    ).toEqual('نویسنده، مترجم');
  });

  it('writes nothing for a category that defines no fields', () => {
    expect(formatCategoryFieldNames([])).toEqual('');
    expect(formatCategoryFieldNames(undefined)).toEqual('');
  });

  it('reads back what it wrote', () => {
    const fields = [{ name: 'نویسنده' }, { name: 'مترجم' }];

    expect(parseCategoryFieldNames(formatCategoryFieldNames(fields))).toEqual(
      fields,
    );
  });

  it('accepts the separators a person actually types', () => {
    // A sheet is typed by hand as often as it is exported, on a Persian
    // keyboard as often as a Latin one.
    expect(parseCategoryFieldNames('نویسنده, مترجم; ناشر\nسال')).toEqual([
      { name: 'نویسنده' },
      { name: 'مترجم' },
      { name: 'ناشر' },
      { name: 'سال' },
    ]);
  });

  it('keeps a repeated name once', () => {
    // The category cannot hold the same field twice, and failing the row over
    // a word typed twice would be a poor trade.
    expect(parseCategoryFieldNames('رنگ، رنگ، سایز')).toEqual([
      { name: 'رنگ' },
      { name: 'سایز' },
    ]);
  });

  it('compares names the way the unique index does', () => {
    expect(parseCategoryFieldNames('Author, author')).toEqual([
      { name: 'Author' },
    ]);
  });

  it('drops the empties a trailing separator leaves behind', () => {
    expect(parseCategoryFieldNames('نویسنده،  ،')).toEqual([
      { name: 'نویسنده' },
    ]);
  });

  it('has nothing to say about an empty cell', () => {
    expect(parseCategoryFieldNames('')).toEqual([]);
    expect(parseCategoryFieldNames(null)).toEqual([]);
    expect(parseCategoryFieldNames(undefined)).toEqual([]);
  });
});
