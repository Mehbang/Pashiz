import {
  categoryFieldFilterQuery,
  categoryFieldKey,
  parseCategoryFieldKey,
} from './category-field-filter';

describe('category field filter keys', () => {
  it('round-trips a field id through its synthetic key', () => {
    expect(categoryFieldKey(12)).toBe('categoryField_12');
    expect(parseCategoryFieldKey('categoryField_12')).toBe(12);
  });

  it('leaves ordinary field keys alone', () => {
    // The item model falls back to its static meta for anything that is not
    // one of these, so an ordinary key must not be claimed here.
    expect(parseCategoryFieldKey('name')).toBeNull();
    expect(parseCategoryFieldKey('categoryId')).toBeNull();
    expect(parseCategoryFieldKey('categoryField_')).toBeNull();
    expect(parseCategoryFieldKey('categoryField_abc')).toBeNull();
  });
});

describe('categoryFieldFilterQuery()', () => {
  /** A builder that records which existence form was asked for. */
  const spyBuilder = () => {
    const calls: Array<{ kind: string; conditions: any[] }> = [];

    const inner = () => {
      const conditions: any[] = [];
      const qb: any = {
        select: () => qb,
        from: () => qb,
        whereRaw: () => qb,
        where: (...args: any[]) => {
          conditions.push(args);
          return qb;
        },
      };
      return { qb, conditions };
    };

    const record = (kind: string) => (fn: (qb: any) => void) => {
      const { qb, conditions } = inner();
      fn(qb);
      calls.push({ kind, conditions });
    };

    return {
      calls,
      whereExists: record('exists'),
      whereNotExists: record('notExists'),
    };
  };

  it('matches items holding a value for that field', () => {
    const builder = spyBuilder();

    categoryFieldFilterQuery(7)(builder, {
      comparator: 'contains',
      value: 'دولت‌آبادی',
    });

    expect(builder.calls[0].kind).toBe('exists');
    // The field is pinned, then the value is compared.
    expect(builder.calls[0].conditions).toContainEqual([
      'item_field_values.category_field_id',
      7,
    ]);
    expect(builder.calls[0].conditions).toContainEqual([
      'item_field_values.value',
      'LIKE',
      '%دولت‌آبادی%',
    ]);
  });

  it('negates the existence check rather than the comparison', () => {
    const builder = spyBuilder();

    categoryFieldFilterQuery(7)(builder, {
      comparator: 'not_contains',
      value: 'x',
    });

    // Negating the inner condition instead would drop every item that has no
    // value for the field at all, though it plainly does not contain "x".
    expect(builder.calls[0].kind).toBe('notExists');
    expect(builder.calls[0].conditions).toContainEqual([
      'item_field_values.value',
      'LIKE',
      '%x%',
    ]);
  });

  it('compares exactly when asked to', () => {
    const builder = spyBuilder();

    categoryFieldFilterQuery(3)(builder, { comparator: 'equals', value: 'XL' });

    expect(builder.calls[0].conditions).toContainEqual([
      'item_field_values.value',
      'XL',
    ]);
  });

  it('treats a missing comparator as a contains search', () => {
    const builder = spyBuilder();

    categoryFieldFilterQuery(3)(builder, { value: 'قرمز' });

    expect(builder.calls[0].kind).toBe('exists');
    expect(builder.calls[0].conditions).toContainEqual([
      'item_field_values.value',
      'LIKE',
      '%قرمز%',
    ]);
  });
});
