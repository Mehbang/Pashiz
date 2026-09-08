import { ModuleRef } from '@nestjs/core';
import { pickBy, mapValues } from 'lodash';
import { I18nService } from 'nestjs-i18n';
import { WarehousesSettings } from '../Warehouses/WarehousesSettings';
import { Inject, Injectable } from '@nestjs/common';
import { BranchesSettingsService } from '../Branches/BranchesSettings';
import { ServiceError } from '../Items/ServiceError';
import { IModelMetaColumn, IModelMetaField2 } from '@/interfaces/Model';
import { IModelMeta } from '@/interfaces/Model';
import { IModelMetaField } from '@/interfaces/Model';
import { Features } from '@/common/types/Features';
import { resourceToModelName } from './_utils';
import { ItemCategoryField } from '@/modules/ItemCategories/models/ItemCategoryField.model';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';
import {
  categoryFieldAccessor,
  categoryFieldKey,
  categoryFieldLabel,
} from '@/modules/Items/utils/category-field-filter';

const ERRORS = {
  RESOURCE_MODEL_NOT_FOUND: 'RESOURCE_MODEL_NOT_FOUND',
};

@Injectable()
export class ResourceService {
  constructor(
    private readonly branchesSettings: BranchesSettingsService,
    private readonly warehousesSettings: WarehousesSettings,
    private readonly moduleRef: ModuleRef,
    private readonly i18nService: I18nService,

    @Inject(ItemCategoryField.name)
    private readonly itemCategoryFieldModel: TenantModelProxy<
      typeof ItemCategoryField
    >,
  ) {}

  /**
   * Retrieve resource model object.
   * @param {string} inputModelName - Input model name.
   */
  public getResourceModel(inputModelName: string) {
    const modelName = resourceToModelName(inputModelName);
    const resourceModel = this.moduleRef.get(modelName, { strict: false });

    if (!resourceModel) {
      throw new ServiceError(ERRORS.RESOURCE_MODEL_NOT_FOUND);
    }
    return resourceModel;
  }

  /**
   * Retrieve the resource meta.
   * @param {string} modelName - Model name.
   * @param {string} metakey - Meta key.
   * @returns {IModelMeta}
   */
  public getResourceMeta(modelName: string, metakey?: string): IModelMeta {
    const resourceModel = this.getResourceModel(modelName);

    // Retrieve the resource meta.
    const resourceMeta = resourceModel().getMeta(metakey);

    // Localization the fields names.
    return resourceMeta;
  }

  /**
   * Retrieve the resource fields.
   * @param {string} modelName
   * @returns {IModelMetaField}
   */
  public getResourceFields(modelName: string): {
    [key: string]: IModelMetaField;
  } {
    const meta = this.getResourceMeta(modelName);

    return meta.fields;
  }

  /**
   * Filter the fields based on the features.
   * @param {IModelMetaField2} fields
   * @returns {IModelMetaField2}
   */
  public filterSupportFeatures = async (
    fields: Record<string, IModelMetaField2 | IModelMetaColumn>,
  ) => {
    const isMultiFeaturesEnabled =
      await this.branchesSettings.isMultiBranchesActive();
    const isMultiWarehousesEnabled =
      await this.warehousesSettings.isMultiWarehousesActive();

    return pickBy(fields, (field) => {
      if (
        !isMultiWarehousesEnabled &&
        field.features?.includes(Features.WAREHOUSES)
      ) {
        return false;
      }
      if (
        !isMultiFeaturesEnabled &&
        field.features?.includes(Features.BRANCHES)
      ) {
        return false;
      }
      return true;
    });
  };

  /**
   * Localizes a single field by translating its name, importHint and the
   * enumeration options labels.
   * @param {IModelMetaField2} field - The field to localize.
   * @returns {IModelMetaField2} - The localized field.
   */
  private localizeField(field: IModelMetaField2): IModelMetaField2 {
    return {
      ...field,
      name: this.i18nService.t(field.name, { defaultValue: field.name }),
      ...(field.importHint
        ? {
            importHint: this.i18nService.t(field.importHint, {
              defaultValue: field.importHint,
            }),
          }
        : {}),
      // Localize the enumeration options labels.
      ...(field.fieldType === 'enumeration' && field.options
        ? {
            options: field.options.map((option) => ({
              ...option,
              label: this.i18nService.t(option.label, {
                defaultValue: option.label,
              }),
            })),
          }
        : {}),
      // Recursively localize nested fields (for collection types)
      ...(field.fields
        ? {
            fields: this.localizeFields(
              field.fields as unknown as Record<string, IModelMetaField2>,
            ) as unknown as typeof field.fields,
          }
        : {}),
    } as IModelMetaField2;
  }

  /**
   * Localizes all fields in a fields map.
   * @param {Record<string, IModelMetaField2>} fields - The fields to localize.
   * @returns {Record<string, IModelMetaField2>} - The localized fields.
   */
  private localizeFields(
    fields: Record<string, IModelMetaField2>,
  ): Record<string, IModelMetaField2> {
    return mapValues(fields, (field) => this.localizeField(field));
  }

  /**
   * Localizes a single column by translating its name.
   * @param {IModelMetaColumn} column - The column to localize.
   * @returns {IModelMetaColumn} - The localized column.
   */
  private localizeColumn(column: IModelMetaColumn): IModelMetaColumn {
    return {
      ...column,
      name: this.i18nService.t(column.name, { defaultValue: column.name }),
      // Recursively localize nested columns (for collection types)
      ...('columns' in column
        ? {
            columns: mapValues(
              column.columns as Record<string, IModelMetaColumn>,
              (nestedColumn) => this.localizeColumn(nestedColumn),
            ),
          }
        : {}),
    } as IModelMetaColumn;
  }

  /**
   * Localizes the columns of the given columns map.
   * @param {Record<string, IModelMetaColumn>} columns - The columns to localize.
   * @returns {Record<string, IModelMetaColumn>} - The localized columns.
   */
  private localizeColumns(
    columns: Record<string, IModelMetaColumn>,
  ): Record<string, IModelMetaColumn> {
    return mapValues(columns, (column) => this.localizeColumn(column));
  }

  /**
   * Localizes the resource meta fields, fields2 and columns names and the
   * enumeration options labels based on the current request language.
   * @param {IModelMeta} meta - The resource meta to localize.
   * @returns {IModelMeta} - The localized resource meta.
   */
  /**
   * The fields an organization invented on its categories.
   *
   * They belong to no column and are not known until the database is read, so
   * they are appended to the item resource's meta rather than declared in it.
   * The same list answers three questions — what can be filtered on, what a
   * spreadsheet column can be mapped to, and what is exported — so it is read
   * once and shaped per caller.
   */
  private async getItemCategoryFieldRows(): Promise<
    Array<{ id: number; key: string; label: string }>
  > {
    const fields = await this.itemCategoryFieldModel()
      .query()
      .withGraphFetched('category')
      // Grouped by category, then in the order the category arranged them:
      // a filter list and a spreadsheet both read better with a category's
      // fields together than with every category's first field first.
      .orderBy('categoryId', 'asc')
      .orderBy('index', 'asc');

    return fields.map((field) => ({
      id: field.id,
      key: categoryFieldKey(field.id),
      label: categoryFieldLabel(field.name, (field as any).category?.name),
    }));
  }

  /**
   * Those fields as meta fields — what a filter names and what an import maps
   * a spreadsheet column onto. Free text in both cases.
   */
  public async getCategoryFilterFields(): Promise<Record<string, any>> {
    const rows = await this.getItemCategoryFieldRows();

    return rows.reduce(
      (acc, row) => {
        acc[row.key] = { name: row.label, fieldType: 'text' };
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  /**
   * Those fields as export columns, one per field, reading the item's answer
   * off the map the items exportable builds for the sheet.
   */
  public async getCategoryExportColumns(): Promise<Record<string, any>> {
    const rows = await this.getItemCategoryFieldRows();

    return rows.reduce(
      (acc, row) => {
        acc[row.key] = {
          name: row.label,
          type: 'text',
          accessor: categoryFieldAccessor(row.id),
          printable: false,
        };
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  /**
   * Whether the resource is the item, whose meta grows at runtime.
   *
   * The name arrives spelled however the caller had it — `items`, `Item`,
   * `item` — so it is normalized the same way the model lookup normalizes it.
   */
  private isItemResource(modelName: string): boolean {
    return resourceToModelName(modelName) === 'Item';
  }

  public localizeResourceMeta(meta: IModelMeta): IModelMeta {
    return {
      ...meta,
      fields: this.localizeFields(
        meta.fields as unknown as Record<string, IModelMetaField2>,
      ) as Record<string, IModelMetaField>,
      fields2: this.localizeFields(meta.fields2),
      columns: this.localizeColumns(meta.columns),
    };
  }

  /**
   * Retrieve the resource fields with localized names and hints.
   * @param {string} modelName
   * @returns {IModelMetaField2}
   */
  public async getResourceFields2(modelName: string): Promise<{
    [key: string]: IModelMetaField2;
  }> {
    const meta = this.getResourceMeta(modelName);
    const filteredFields = await this.filterSupportFeatures(meta.fields2);
    const localized = this.localizeFields(
      filteredFields as Record<string, IModelMetaField2>,
    );
    // An import sheet can carry a column for a field a category invented, and
    // the mapping screen only offers what this list holds.
    if (!this.isItemResource(modelName)) {
      return localized;
    }
    const categoryFields = await this.getCategoryFilterFields();

    return { ...localized, ...categoryFields };
  }

  /**
   * Retrieve the resource columns.
   * @param {string} modelName - The model name.
   * @returns {IModelMetaColumn}
   */
  public async getResourceColumns(modelName: string) {
    const meta = this.getResourceMeta(modelName);
    const columns = await this.filterSupportFeatures(meta.columns);

    // The item exports a column per field its categories define, so a sheet
    // taken out of Pashiz can be edited and brought back whole.
    if (!this.isItemResource(modelName)) {
      return columns;
    }
    const categoryColumns = await this.getCategoryExportColumns();

    return { ...columns, ...categoryColumns };
  }

  /**
   * Retrieve the resource importable fields.
   * @param {string} modelName - The model name.
   * @returns {IModelMetaField}
   */
  public getResourceImportableFields(modelName: string): {
    [key: string]: IModelMetaField;
  } {
    const fields = this.getResourceFields(modelName);

    return pickBy(fields, (field) => field.importable);
  }
}
