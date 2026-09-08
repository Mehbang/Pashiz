import { convertFieldsToYupValidation, valueParser } from './_utils';

const typeField = {
  name: 'نوع کالا',
  fieldType: 'enumeration',
  required: true,
  options: [
    { key: 'inventory', label: 'موجودی' },
    { key: 'service', label: 'خدمت' },
  ],
} as any;

describe('reading an enumeration column', () => {
  const parse = (value: unknown) =>
    valueParser({ type: typeField } as any, () => null)(value, 'type');

  it('reads the label, which is what an export writes', async () => {
    await expect(parse('خدمت')).resolves.toEqual('service');
  });

  it('reads the key too', async () => {
    // A sheet written against the English build, or by hand from the API,
    // says `service` where the Persian one says «خدمت».
    await expect(parse('service')).resolves.toEqual('service');
    await expect(parse('  Service ')).resolves.toEqual('service');
  });

  it('hands on a word that is neither, so validation can name what is accepted', async () => {
    await expect(parse('کالای فیزیکی')).resolves.toEqual('کالای فیزیکی');
  });

  it('has nothing to say about an empty cell', async () => {
    await expect(parse('')).resolves.toBeUndefined();
    await expect(parse('   ')).resolves.toBeUndefined();
  });
});

describe('what an import tells the reader went wrong', () => {
  const messagesOf = async (schema: any, data: Record<string, unknown>) => {
    try {
      await schema.validate(data, { abortEarly: false });
      return [];
    } catch (error) {
      return error.errors as string[];
    }
  };

  it('names the field in the reader\u2019s language', async () => {
    // The wording used to be Yup's own English around a translated field name:
    // "نوع کالا is a required field".
    const t = (key: string, args: Record<string, any> = {}) =>
      key === 'import.validation.required' ? `«${args.field}» الزامی است` : key;
    const schema = convertFieldsToYupValidation({ type: typeField } as any, t);

    expect(await messagesOf(schema, {})).toEqual(['«نوع کالا» الزامی است']);
  });

  it('lists the words the sheet should have carried, not the keys behind them', async () => {
    const t = (key: string, args: Record<string, any> = {}) =>
      key === 'import.validation.list_separator'
        ? '، '
        : `یکی از: ${args.options}`;
    const schema = convertFieldsToYupValidation(
      { type: { ...typeField, required: false } } as any,
      t,
    );

    expect(await messagesOf(schema, { type: 'کالای فیزیکی' })).toEqual([
      'یکی از: موجودی، خدمت',
    ]);
  });

  it('still says something sensible with no translator at all', async () => {
    const schema = convertFieldsToYupValidation({ type: typeField } as any);

    expect(await messagesOf(schema, {})).toEqual([
      'نوع کالا is a required field',
    ]);
  });

  it('separates the list the way the language does', async () => {
    // English joins with a comma, Persian with «،» — the separator belongs to
    // the translation, and hard-coding either one puts the wrong mark in the
    // other language's message.
    const schema = convertFieldsToYupValidation({
      type: { ...typeField, required: false },
    } as any);

    expect(await messagesOf(schema, { type: 'nonsense' })).toEqual([
      'نوع کالا must be one of: موجودی, خدمت',
    ]);
  });
});
