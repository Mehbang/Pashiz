import * as Yup from 'yup';
import * as moment from 'moment';
import * as R from 'ramda';
import { Knex } from 'knex';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  defaultTo,
  upperFirst,
  camelCase,
  first,
  isUndefined,
  pickBy,
  isEmpty,
  castArray,
  get,
  head,
  split,
  last,
} from 'lodash';
import * as pluralize from 'pluralize';
import { ResourceMetaFieldsMap } from './interfaces';
import { multiNumberParse } from '@/utils/multi-number-parse';
import { ServiceError } from '../Items/ServiceError';
import { IModelMetaField, IModelMetaField2 } from '@/interfaces/Model';

export const ERRORS = {
  RESOURCE_NOT_IMPORTABLE: 'RESOURCE_NOT_IMPORTABLE',
  INVALID_MAP_ATTRS: 'INVALID_MAP_ATTRS',
  DUPLICATED_FROM_MAP_ATTR: 'DUPLICATED_FROM_MAP_ATTR',
  DUPLICATED_TO_MAP_ATTR: 'DUPLICATED_TO_MAP_ATTR',
  IMPORT_FILE_NOT_MAPPED: 'IMPORT_FILE_NOT_MAPPED',
  INVALID_MAP_DATE_FORMAT: 'INVALID_MAP_DATE_FORMAT',
  MAP_DATE_FORMAT_NOT_DEFINED: 'MAP_DATE_FORMAT_NOT_DEFINED',
  IMPORTED_SHEET_EMPTY: 'IMPORTED_SHEET_EMPTY',
};

/**
 * Trimms the imported object string values before parsing.
 * @param {Record<string, string | number>} obj
 * @returns {<Record<string, string | number>}
 */
export function trimObject(obj: Record<string, string | number>) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    // Trim the key
    const trimmedKey = key.trim();

    // Trim the value if it's a string, otherwise leave it as is
    const trimmedValue = typeof value === 'string' ? value.trim() : value;

    // Assign the trimmed key and value to the accumulator object
    return { ...acc, [trimmedKey]: trimmedValue };
  }, {});
}

/**
 * Puts a validation message in the reader's language.
 *
 * The message is built per field rather than left to Yup's own `${path}`
 * placeholders: those are interpolated by Yup, the translations are
 * interpolated by nestjs-i18n, and the two syntaxes overlap badly. By the time
 * a message is built the field's own name is already localized, so it is
 * simply passed in.
 */
export type ImportMessages = (
  key: string,
  args?: Record<string, string | number>,
) => string;

/**
 * What the messages say when nobody has supplied a translator — the wording
 * this function had before it could be translated at all.
 */
const englishMessages: ImportMessages = (key, args = {}) => {
  const field = args.field ?? 'field';

  switch (key) {
    case 'import.validation.required':
      return `${field} is a required field`;
    case 'import.validation.min_length':
      return `Minimum length of ${field} is ${args.min} characters`;
    case 'import.validation.max_length':
      return `Maximum length of ${field} is ${args.max} characters`;
    case 'import.validation.min':
      return `${field} must be greater than or equal to ${args.min}`;
    case 'import.validation.max':
      return `${field} must be less than or equal to ${args.max}`;
    case 'import.validation.one_of':
      return `${field} must be one of: ${args.options}`;
    case 'import.validation.date':
      return `${field} is not a valid date. Use the YYYY-MM-DD format.`;
    case 'import.validation.url':
      return `${field} must be a valid URL`;
    case 'import.validation.list_separator':
      return ', ';
    default:
      return key;
  }
};

/**
 * Generates the Yup validation schema based on the given resource fields.
 * @param {ResourceMetaFieldsMap} fields
 * @param {ImportMessages} t - Puts the messages in the reader's language.
 * @returns {Yup}
 */
export const convertFieldsToYupValidation = (
  fields: ResourceMetaFieldsMap,
  t: ImportMessages = englishMessages,
) => {
  const yupSchema = {};

  Object.keys(fields).forEach((fieldName: string) => {
    const field = fields[fieldName] as IModelMetaField;
    const name = field.name;
    let fieldSchema;
    fieldSchema = Yup.string().label(name);

    if (field.fieldType === 'text') {
      if (!isUndefined(field.minLength)) {
        fieldSchema = fieldSchema.min(
          field.minLength,
          t('import.validation.min_length', {
            field: name,
            min: field.minLength,
          }),
        );
      }
      if (!isUndefined(field.maxLength)) {
        fieldSchema = fieldSchema.max(
          field.maxLength,
          t('import.validation.max_length', {
            field: name,
            max: field.maxLength,
          }),
        );
      }
    } else if (field.fieldType === 'number') {
      fieldSchema = Yup.number().label(name);

      if (!isUndefined(field.max)) {
        fieldSchema = fieldSchema.max(
          field.max,
          t('import.validation.max', { field: name, max: field.max }),
        );
      }
      if (!isUndefined(field.min)) {
        fieldSchema = fieldSchema.min(
          field.min,
          t('import.validation.min', { field: name, min: field.min }),
        );
      }
    } else if (field.fieldType === 'boolean') {
      fieldSchema = Yup.boolean().label(name);
    } else if (field.fieldType === 'enumeration') {
      const options = field.options.reduce((acc, option) => {
        acc[option.key] = option.label;
        return acc;
      }, {});
      fieldSchema = Yup.string()
        .oneOf(
          Object.keys(options),
          // The sheet is written with the labels, not the keys, so the message
          // has to name the labels or it lists words nobody typed.
          t('import.validation.one_of', {
            field: name,
            // Persian separates a list with «،», English with a comma; which
            // one to use is part of the translation, not of this code.
            options: Object.values(options).join(
              t('import.validation.list_separator'),
            ),
          }),
        )
        .label(name);
      // Validate date field type.
    } else if (field.fieldType === 'date') {
      fieldSchema = fieldSchema.test(
        'date validation',
        t('import.validation.date', { field: name }),
        (val) => {
          if (!val) {
            return true;
          }
          return moment(val, 'YYYY-MM-DD', true).isValid();
        },
      );
    } else if (field.fieldType === 'url') {
      fieldSchema = fieldSchema.url(
        t('import.validation.url', { field: name }),
      );
    } else if (field.fieldType === 'collection') {
      // @ts-expect-error
      const nestedFieldShema = convertFieldsToYupValidation(field.fields, t);
      fieldSchema = Yup.array().label(name);

      if (!isUndefined(field.collectionMaxLength)) {
        fieldSchema = fieldSchema.max(field.collectionMaxLength);
      }
      if (!isUndefined(field.collectionMinLength)) {
        fieldSchema = fieldSchema.min(field.collectionMinLength);
      }
      fieldSchema = fieldSchema.of(nestedFieldShema);
    }
    if (field.required) {
      fieldSchema = fieldSchema.required(
        t('import.validation.required', { field: name }),
      );
    }
    const _fieldName = parseFieldName(fieldName, field);

    yupSchema[_fieldName] = fieldSchema;
  });
  return Yup.object().shape(yupSchema);
};

const parseFieldName = (fieldName: string, field: IModelMetaField) => {
  let _key = fieldName;

  if (field.dataTransferObjectKey) {
    _key = field.dataTransferObjectKey;
  }
  return _key;
};

/**
 * Retrieves the unmapped sheet columns.
 * @param columns
 * @param mapping
 * @returns
 */
export const getUnmappedSheetColumns = (columns, mapping) => {
  return columns.filter(
    (column) => !mapping.some((map) => map.from === column),
  );
};

export const sanitizeResourceName = (resourceName: string) => {
  return upperFirst(camelCase(pluralize(resourceName, 1)));
};

export const getSheetColumns = (sheetData: unknown[]) => {
  return Object.keys(first(sheetData));
};

/**
 * Retrieves the unique value from the given imported object DTO based on the
 * configured unique resource field.
 * @param {{ [key: string]: IModelMetaField }} importableFields -
 * @param {<Record<string, any>}
 * @returns {string}
 */
export const getUniqueImportableValue = (
  importableFields: { [key: string]: IModelMetaField2 },
  objectDTO: Record<string, any>,
) => {
  const uniqueImportableValue = pickBy(
    importableFields,
    (field) => field.unique,
  );
  const uniqueImportableKeys = Object.keys(uniqueImportableValue);
  const uniqueImportableKey = first(uniqueImportableKeys);

  return defaultTo(objectDTO[uniqueImportableKey], '');
};

/**
 * Throws service error the given sheet is empty.
 * @param {Array<any>} sheetData
 */
export const validateSheetEmpty = (sheetData: Array<any>) => {
  if (isEmpty(sheetData)) {
    throw new ServiceError(ERRORS.IMPORTED_SHEET_EMPTY);
  }
};

const booleanValuesRepresentingTrue: string[] = ['true', 'yes', 'y', 't', '1'];
const booleanValuesRepresentingFalse: string[] = ['false', 'no', 'n', 'f', '0'];

/**
 * Parses the given string value to boolean.
 * @param {string} value
 * @returns {string|null}
 */
export const parseBoolean = (value: string): boolean | null => {
  const normalizeValue = (value: string): string =>
    value.toString().trim().toLowerCase();

  const normalizedValue = normalizeValue(value);
  const valuesRepresentingTrue =
    booleanValuesRepresentingTrue.map(normalizeValue);
  const valueRepresentingFalse =
    booleanValuesRepresentingFalse.map(normalizeValue);

  if (valuesRepresentingTrue.includes(normalizedValue)) {
    return true;
  } else if (valueRepresentingFalse.includes(normalizedValue)) {
    return false;
  }
  return null;
};

export const transformInputToGroupedFields = (input) => {
  const output = [];

  // Group for non-nested fields
  const mainGroup = {
    groupLabel: '',
    groupKey: '',
    fields: [],
  };
  input.forEach((item) => {
    if (!item.fields) {
      // If the item does not have nested fields, add it to the main group
      mainGroup.fields.push(item);
    } else {
      // If the item has nested fields, create a new group for these fields
      output.push({
        groupLabel: item.name,
        groupKey: item.key,
        fields: item.fields,
      });
    }
  });
  // Add the main group to the output if it contains any fields
  if (mainGroup.fields.length > 0) {
    output.unshift(mainGroup); // Add the main group at the beginning
  }
  return output;
};

export const getResourceColumns = (resourceColumns: {
  [key: string]: IModelMetaField2;
}) => {
  const mapColumn =
    (group: string) =>
    ([fieldKey, { name, importHint, required, order, ...field }]: [
      string,
      IModelMetaField2,
    ]) => {
      const extra: Record<string, any> = {};
      const key = fieldKey;

      if (group) {
        extra.group = group;
      }
      if (field.fieldType === 'collection') {
        extra.fields = mapColumns(field.fields, key);
      }
      return {
        key,
        name,
        required,
        hint: importHint,
        order,
        ...extra,
      };
    };
  const sortColumn = (a, b) =>
    a.order && b.order ? a.order - b.order : a.order ? -1 : b.order ? 1 : 0;

  const mapColumns = (columns, parentKey = '') =>
    Object.entries(columns).map(mapColumn(parentKey)).sort(sortColumn);

  return R.compose(transformInputToGroupedFields, mapColumns)(resourceColumns);
};

export type ModelResolver = (modelName: string) => any;

// Prases the given object value based on the field key type.
export const valueParser =
  (
    fields: ResourceMetaFieldsMap,
    modelResolver: ModelResolver,
    trx?: Knex.Transaction,
  ) =>
  async (value: any, key: string, group = '') => {
    let _value = value;

    const fieldKey = key.includes('.') ? key.split('.')[0] : key;
    const field = group ? fields[group]?.fields[fieldKey] : fields[fieldKey];

    // Parses the boolean value.
    if (field.fieldType === 'boolean') {
      _value = parseBoolean(value);

      // Parses the enumeration value.
    } else if (field.fieldType === 'enumeration') {
      // The label is what the sheet is expected to carry, since that is what
      // an export writes and what the mapping screen shows. The key is
      // accepted too: a sheet written against the English build, or by hand
      // from the API, says `service` where the Persian one says «خدمت», and
      // there is no reason to refuse it. A key that matches nothing leaves the
      // value undefined, which reads downstream as a missing required field —
      // an error that names the column and hides the cause.
      const written = String(value ?? '')
        .trim()
        .toLowerCase();
      const options = get(field, 'options', []);
      const option =
        options.find((option) => option.label?.toLowerCase() === written) ??
        options.find((option) => option.key?.toLowerCase() === written);

      // A word matching nothing is handed on as written so that validation can
      // say what the column accepts. Dropping it to undefined instead made the
      // row fail as a missing required field — an error naming the column and
      // hiding the cause — or, for an optional column, pass silently with the
      // value thrown away.
      _value = option ? option.key : written ? value : undefined;
      // Parses the numeric value.
    } else if (field.fieldType === 'number') {
      _value = multiNumberParse(value);
      // Parses the relation value.
    } else if (field.fieldType === 'relation') {
      const RelationModel = modelResolver(field.relationModel);

      if (!RelationModel) {
        throw new Error(`The relation model of ${key} field is not exist.`);
      }
      const relationQuery = RelationModel.query(trx);
      const relationKeys = castArray(field?.relationImportMatch);

      relationQuery.where(function () {
        relationKeys.forEach((relationKey: string) => {
          this.orWhereRaw('LOWER(??) = LOWER(?)', [relationKey, value]);
        });
      });
      const result = await relationQuery.first();
      _value = get(result, 'id');
    } else if (field.fieldType === 'collection') {
      const ObjectFieldKey = key.includes('.') ? key.split('.')[1] : key;
      const _valueParser = valueParser(fields, modelResolver);
      _value = await _valueParser(value, ObjectFieldKey, fieldKey);
    }
    return _value;
  };

/**
 * Parses the field key and detarmines the key path.
 * @param {{ [key: string]: IModelMetaField2 }} fields
 * @param {string} key - Mapped key path. formats: `group.key` or `key`.
 * @returns {string}
 */
export const parseKey =
  (fields: { [key: string]: IModelMetaField2 }) =>
  (key: string): string => {
    const fieldKey = getFieldKey(key);
    const field = fields[fieldKey];
    let _key = key;

    if (field.fieldType === 'collection') {
      if (field.collectionOf === 'object') {
        const nestedFieldKey = last(key.split('.'));
        _key = `${fieldKey}[0].${nestedFieldKey}`;
      } else if (
        field.collectionOf === 'string' ||
        field.collectionOf ||
        'numberic'
      ) {
        _key = `${fieldKey}`;
      }
    }
    return _key;
  };

/**
 * Retrieves the field root key, for instance: I -> entries.itemId O -> entries.
 * @param {string} input
 * @returns {string}
 */
export const getFieldKey = (input: string) => {
  const keys = split(input, '.');
  const firstKey = head(keys).split('[')[0]; // Split by "[" in case of array notation
  return firstKey;
};

/**
{ * Aggregates the input array of objects based on a comparator attribute and groups the entries.
 * This function is useful for combining multiple entries into a single entry based on a specific attribute,
 * while aggregating other attributes into an array.}
 *
 * @param {Array} input - The array of objects to be aggregated.
 * @param {string} comparatorAttr - The attribute of the objects used for comparison to aggregate.
 * @param {string} groupOn - The attribute of the objects where the grouped entries will be pushed.
 * @returns {Array} - The aggregated array of objects.
 *
 * @example
 * // Example input:
 * const input = [
 *   { id: 1, name: 'John', entries: ['entry1'] },
 *   { id: 2, name: 'Jane', entries: ['entry2'] },
 *   { id: 1, name: 'John', entries: ['entry3'] },
 * ];
 * const comparatorAttr = 'id';
 * const groupOn = 'entries';
 *
 * // Example output:
 * const output = [
 *   { id: 1, name: 'John', entries: ['entry1', 'entry3'] },
 *   { id: 2, name: 'Jane', entries: ['entry2'] },
 * ];
 */
export function aggregate(
  input: Array<any>,
  comparatorAttr: string,
  groupOn: string,
): Array<Record<string, any>> {
  return input.reduce((acc, curr) => {
    // Skip aggregation if the current item doesn't have the comparator attribute
    if (curr[comparatorAttr] === undefined || curr[comparatorAttr] === null) {
      acc.push({ ...curr });
      return acc;
    }
    const existingEntry = acc.find(
      (entry) => entry[comparatorAttr] === curr[comparatorAttr],
    );

    if (existingEntry) {
      existingEntry[groupOn].push(...curr[groupOn]);
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, []);
}

/**
 * Sanitizes the data in the imported sheet by trimming object keys.
 * @param json - The JSON data representing the imported sheet.
 * @returns {string[][]} - The sanitized data with trimmed object keys.
 */
export const sanitizeSheetData = (json) => {
  return R.compose(R.map(trimObject))(json);
};

/**
 * Returns the path to map a value to based on the 'to' and 'group' parameters.
 * @param {string} to - The target key to map the value to.
 * @param {string} group - The group key to nest the target key under.
 * @returns {string} - The path to map the value to.
 */
export const getMapToPath = (to: string, group = '') =>
  group ? `${group}.${to}` : to;

export const getImportsStoragePath = () => {
  return path.join(global.__static_dirname, `/imports`);
};

/**
 * Deletes the imported file from the storage and database.
 * @param {string} filename
 */
export const deleteImportFile = async (filename: string) => {
  const filePath = getImportsStoragePath();

  // Deletes the imported file.
  await fs.unlink(`${filePath}/${filename}`).catch((error) => {
    // Ignore the error if the file does not exist.
    if (error.code !== 'ENOENT') {
      throw error;
    }
  });
};

/**
 * Reads the import file.
 * @param {string} filename
 * @returns {Promise<Buffer>}
 */
export const readImportFile = (filename: string) => {
  const filePath = getImportsStoragePath();

  return fs.readFile(`${filePath}/${filename}`);
};
