// import { getTransactionTypeLabel } from '@/utils/transactions-types';
import { Transformer } from '../../Transformer/Transformer';

export class GetPdfTemplateTransformer extends Transformer {
  /**
   * Included attributes.
   * @returns {string[]}
   */
  public includeAttributes = (): string[] => {
    return [
      'templateName',
      'createdAtFormatted',
      'resourceFormatted',
      'attributes',
      'companyLogoUri',
    ];
  };

  /**
   * Formats the creation date of the PDF template.
   * @param {Object} template
   * @returns {string} A formatted string representing the creation date of the template.
   */
  protected createdAtFormatted = (template) => {
    return this.formatDate(template.createdAt);
  };

  /**
   * Formats the creation date of the PDF template.
   * @param {Object} template -
   * @returns {string} A formatted string representing the creation date of the template.
   */
  protected resourceFormatted = (template) => {
    // return getTransactionTypeLabel(template.resource);
  };

  /**
   * Retrieves the company logo URI.
   * @param {Object} template
   * @returns {string | null}
   */
  protected companyLogoUri = (template) => {
    return template.companyLogoUri;
  };

  /**
   * Retrieves transformed brand attributes.
   * @param {} template
   * @returns
   */
  protected attributes = (template) => {
    return this.item(
      template.attributes,
      new GetPdfTemplateAttributesTransformer(),
    );
  };
}

class GetPdfTemplateAttributesTransformer extends Transformer {
  /**
   * Included attributes.
   * @returns {string[]}
   */
  public includeAttributes = (): string[] => {
    return [];
  };

  /**
   * The name of the template as the organization reads it.
   *
   * The seeded templates are created by a migration, which has no tenant and
   * no i18n, so their English name is translated here on the way out. A name
   * the user typed is their own wording and is left alone.
   */
  protected templateName = (template) => {
    return template.predefined
      ? (this.context.i18n.t('pdf_template.standard_template', {
          lang: this.context.organization?.language,
        }) as string)
      : template.templateName;
  };
}
