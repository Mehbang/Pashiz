import { Injectable } from '@nestjs/common';
import { IFinancialSheetCommonMeta } from '../types/Report.types';
import { TenancyContext } from '@/modules/Tenancy/TenancyContext.service';
import { InventoryComputeCostService } from '@/modules/InventoryCost/commands/InventoryComputeCost.service';
import { calendarOfLanguage } from '@/utils/jalali-date';

@Injectable()
export class FinancialSheetMeta {
  constructor(
    private readonly tenancyContext: TenancyContext,
    private readonly inventoryComputeCostService: InventoryComputeCostService,
  ) {}

  /**
   * Retrieves the common meta data of the financial sheet.
   * @returns {Promise<IFinancialSheetCommonMeta>}
   */
  async meta(): Promise<IFinancialSheetCommonMeta> {
    const tenantMetadata = await this.tenancyContext.getTenantMetadata();

    const organizationName = tenantMetadata.name;
    const baseCurrency = tenantMetadata.baseCurrency;
    const dateFormat = tenantMetadata.dateFormat;
    const calendar = calendarOfLanguage(tenantMetadata.language);

    const isCostComputeRunning =
      await this.inventoryComputeCostService.isItemsCostComputeRunning();

    return {
      organizationName,
      baseCurrency,
      dateFormat,
      calendar,
      isCostComputeRunning,
      sheetName: '',
    };
  }
}
