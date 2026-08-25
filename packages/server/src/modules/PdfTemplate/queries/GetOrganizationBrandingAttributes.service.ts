import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CommonOrganizationBrandingAttributes } from '../types';
import { TenancyContext } from '../../Tenancy/TenancyContext.service';
import { GetAttachmentPresignedUrl } from '@/modules/Attachments/GetAttachmentPresignedUrl';
import { translateTemplateLabels } from '../utils/translate-template-labels';

@Injectable()
export class GetOrganizationBrandingAttributesService {
  constructor(
    private readonly tenancyContext: TenancyContext,
    private readonly getPresignedUrlService: GetAttachmentPresignedUrl,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Lays the organization's branding over a paper template's default
   * attributes, with the default labels translated into the organization's
   * language first.
   * @param {T} defaults - The resource's default template attributes.
   * @returns {Promise<T>}
   */
  public async withDefaults<T extends Record<string, any>>(
    defaults: T,
    options?: { titleKey?: string },
  ): Promise<T> {
    const tenant = await this.tenancyContext.getTenant(true);
    const branding = await this.execute();

    return {
      ...translateTemplateLabels(
        defaults,
        this.i18n,
        tenant.metadata?.language,
        options,
      ),
      ...branding,
    } as T;
  }

  /**
   * Retrieves the given organization branding attributes initial state.
   * @returns {Promise<CommonOrganizationBrandingAttributes>}
   */
  public async execute(): Promise<CommonOrganizationBrandingAttributes> {
    const tenant = await this.tenancyContext.getTenant(true);
    const tenantMetadata = tenant.metadata;

    const companyName = tenantMetadata?.name;
    const primaryColor = tenantMetadata?.primaryColor;
    const companyLogoKey = tenantMetadata?.logoKey;
    const companyAddress = tenantMetadata?.addressTextFormatted;

    let companyLogoUri: string | null = null;
    if (companyLogoKey) {
      try {
        companyLogoUri =
          await this.getPresignedUrlService.getPresignedUrl(companyLogoKey);
      } catch {
        companyLogoUri = null;
      }
    }

    return {
      companyName,
      companyAddress,
      companyLogoUri: companyLogoUri ?? undefined,
      companyLogoKey,
      primaryColor,
    };
  }
}
