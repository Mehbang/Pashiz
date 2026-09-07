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

  it('also accepts the snake-cased spelling the interface sends back', () => {
    // The meta endpoint snake-cases its keys on the way out, so the filter
    // arrives as `category_field_1` even though it is minted camel-cased.
    expect(parseCategoryFieldKey('category_field_12')).toBe(12);
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
    const calls: Array<{ kind: string; conditions: any[]; raws: string[] }> =
      [];

    const inner = () => {
      const conditions: any[] = [];
      const raws: string[] = [];
      const qb: any = {
        select: () => qb,
        from: () => qb,
        whereRaw: (sql: string) => {
          raws.push(sql);
          return qb;
        },
        where: (...args: any[]) => {
          conditions.push(args);
          return qb;
        },
      };
      return { qb, conditions, raws };
    };

    const record = (kind: string) => (fn: (qb: any) => void) => {
      const { qb, conditions, raws } = inner();
      fn(qb);
      calls.push({ kind, conditions, raws });
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

  it('correlates the subquery in the casing the mapper produces', () => {
    const builder = spyBuilder();

    categoryFieldFilterQuery(1)(builder, {
      comparator: 'contains',
      value: 'x',
    });

    // Raw SQL escapes the snake-case mapper that upper-cases every other
    // identifier, so a lower-case correlation compiles fine and then fails at
    // the database with "Unknown column".
    expect(builder.calls[0].raws).toEqual([
      '`ITEM_FIELD_VALUES`.`ITEM_ID` = `ITEMS`.`ID`',
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
