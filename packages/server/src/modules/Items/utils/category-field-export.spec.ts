import { get } from 'lodash';
import { withCategoryFieldValues } from './category-field-export';
import { categoryFieldAccessor } from './category-field-filter';

describe('exporting the fields a category defines', () => {
  const item = {
    name: 'کلیدر',
    fieldValues: [
      { categoryFieldId: 3, value: 'محمود دولت‌آبادی' },
      { categoryFieldId: 4, value: '' },
    ],
  };

  it('puts each answer exactly where its column reads', () => {
    // The sheet is built with lodash `get` down the column's accessor. Nothing
    // else checks that the accessor and the map agree, and a mismatch shows up
    // only as an empty column in a downloaded file.
    const row = withCategoryFieldValues(item);

    expect(get(row, categoryFieldAccessor(3))).toEqual('محمود دولت‌آبادی');
  });

  it('leaves an unanswered field to come out as an empty cell', () => {
    const row = withCategoryFieldValues({ name: 'میز', fieldValues: [] });

    expect(get(row, categoryFieldAccessor(3))).toBeUndefined();
  });

  it('keeps the item as it was', () => {
    expect(withCategoryFieldValues(item).name).toEqual('کلیدر');
  });

  it('survives an item fetched without its values', () => {
    expect(
      withCategoryFieldValues({ name: 'میز' }).categoryFieldValues,
    ).toEqual({});
  });
});
