import { describe, expect, it } from 'vitest';
import { itemCategoryFieldValues } from '../category-fields';
import { transformToCamelCase } from '@/utils';
import itemResponse from './item-response.fixture.json';

const item = (over: Record<string, any> = {}) =>
  ({
    id: 1,
    name: 'کلیدر',
    categoryId: 7,
    ...over,
  }) as any;

describe('the category fields shown on the item drawer', () => {
  it('labels each value with the field that asked for it', () => {
    const values = itemCategoryFieldValues(
      item({
        fieldValues: [
          {
            id: 11,
            value: 'محمود دولت‌آبادی',
            categoryField: {
              id: 3,
              name: 'نویسنده',
              categoryId: 7,
              index: 0,
            },
          },
        ],
      }),
    );
    expect(values).toEqual([
      { id: 11, label: 'نویسنده', value: 'محمود دولت‌آبادی' },
    ]);
  });

  it('shows them in the order the category arranged them', () => {
    const values = itemCategoryFieldValues(
      item({
        fieldValues: [
          {
            id: 12,
            value: 'ب',
            categoryField: { id: 4, name: 'مترجم', categoryId: 7, index: 1 },
          },
          {
            id: 11,
            value: 'الف',
            categoryField: { id: 3, name: 'نویسنده', categoryId: 7, index: 0 },
          },
        ],
      }),
    );
    expect(values.map((value) => value.label)).toEqual(['نویسنده', 'مترجم']);
  });

  it('leaves out what belongs to a category the item has left', () => {
    // An item keeps what was typed for its old category so that putting it
    // back restores the values. That history is not what this item is now.
    const values = itemCategoryFieldValues(
      item({
        fieldValues: [
          {
            id: 11,
            value: 'قرمز',
            categoryField: { id: 9, name: 'رنگ', categoryId: 2, index: 0 },
          },
        ],
      }),
    );
    expect(values).toEqual([]);
  });

  it('says nothing about an item in no category', () => {
    expect(itemCategoryFieldValues(item({ categoryId: undefined }))).toEqual(
      [],
    );
  });

  it('says nothing while the item is still loading', () => {
    expect(itemCategoryFieldValues(undefined)).toEqual([]);
  });

  it('survives an item fetched without its values', () => {
    expect(itemCategoryFieldValues(item())).toEqual([]);
  });
});

describe('against what the API actually returns', () => {
  it('reads the shape the drawer is handed', () => {
    // The fixture is a real `GET /items/:id` body, keys and all. The drawer's
    // query asks for the camelCase transform, so the helper sees the response
    // only after `transformToCamelCase` has been over it — and that hop, not
    // the helper, is where a hand-written object would quietly disagree with
    // the server.
    const item = transformToCamelCase(itemResponse) as any;

    expect(itemCategoryFieldValues(item)).toEqual([
      { id: 5, label: 'کارگردان', value: 'داریوش مهرجویی' },
      { id: 7, label: 'بازیگر', value: 'عزت‌الله انتظامی' },
    ]);
  });
});
