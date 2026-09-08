import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ImportInsertError, ResourceMetaFieldsMap } from './interfaces';
import { ERRORS, convertFieldsToYupValidation } from './_utils';
import { IModelMeta } from '@/interfaces/Model';
import { ServiceError } from '../Items/ServiceError';

@Injectable()
export class ImportFileDataValidator {
  constructor(private readonly i18n: I18nService) {}

  /**
   * A validation message in the reader's language.
   *
   * Rows are validated inside a bluebird map inside a transaction, far enough
   * from the request that the ambient language context may already be gone.
   * The language is read defensively and the fallback locale answers when it
   * is: an English message beats a thrown one.
   */
  private translate = (key: string, args: Record<string, any> = {}): string =>
    this.i18n.t(key, { lang: I18nContext.current()?.lang, args });
  /**
   * Validates the given resource is importable.
   * @param {IModelMeta} resourceMeta
   */
  public validateResourceImportable(resourceMeta: IModelMeta) {
    // Throw service error if the resource does not support importing.
    if (!resourceMeta.importable) {
      throw new ServiceError(ERRORS.RESOURCE_NOT_IMPORTABLE);
    }
  }

  /**
   * Validates the given mapped DTOs and returns errors with their index.
   * @param {ResourceMetaFieldsMap} importableFields - Already localized fields from ResourceService
   * @param {Record<string, any>} data
   * @returns {Promise<void | ImportInsertError[]>}
   */
  public async validateData(
    importableFields: ResourceMetaFieldsMap,
    data: Record<string, any>,
  ): Promise<void | ImportInsertError[]> {
    const YupSchema = convertFieldsToYupValidation(
      importableFields,
      this.translate,
    );
    const _data = { ...data };

    try {
      await YupSchema.validate(_data, { abortEarly: false });
    } catch (validationError) {
      const errors = validationError.inner.reduce((errors, error) => {
        const newErrors = error.errors.map((errMsg) => ({
          errorCode: 'ValidationError',
          errorMessage: errMsg,
        }));
        return [...errors, ...newErrors];
      }, []);

      throw errors;
    }
  }
}
