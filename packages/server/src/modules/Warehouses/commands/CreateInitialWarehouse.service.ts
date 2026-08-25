import { CreateWarehouse } from './CreateWarehouse.service';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { TenancyContext } from '@/modules/Tenancy/TenancyContext.service';

@Injectable()
export class CreateInitialWarehouse {
  /**
   * @param {CreateWarehouse} createWarehouse - Create warehouse service.
   * @param {I18nService} i18n - I18n service.
   */
  constructor(
    private readonly createWarehouse: CreateWarehouse,
    private readonly i18n: I18nService,
    private readonly tenancyContext: TenancyContext,
  ) {}

  /**
   * Creates a initial warehouse.
   * @param {number} tenantId
   */
  public createInitialWarehouse = async () => {
    // Without the organization's own language this resolves through the
    // fallback and names the warehouse in English.
    const tenant = await this.tenancyContext.getTenant(true);
    const lang = tenant.metadata?.language;

    return this.createWarehouse.createWarehouse({
      name: this.i18n.t('warehouses.primary_warehouse', { lang }),
      code: '10001',
      primary: true,
    });
  };
}
