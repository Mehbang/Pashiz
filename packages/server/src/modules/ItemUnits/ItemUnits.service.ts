import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { ItemUnit } from './models/ItemUnit.model';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';
import { Item } from '@/modules/Items/models/Item';
import { TENANCY_DB_CONNECTION } from '@/modules/Tenancy/TenancyDB/TenancyDB.constants';
import { ServiceError } from '@/modules/Items/ServiceError';
import { ERRORS } from './ItemUnits.constants';
import { CreateItemUnitDto, EditItemUnitDto } from './ItemUnits.dto';

@Injectable()
export class ItemUnitsService {
  constructor(
    @Inject(ItemUnit.name)
    private readonly itemUnitModel: TenantModelProxy<typeof ItemUnit>,

    @Inject(Item.name)
    private readonly itemModel: TenantModelProxy<typeof Item>,

    @Inject(TENANCY_DB_CONNECTION)
    private readonly tenantKnex: () => Knex,
  ) {}

  public getUnits() {
    return this.itemUnitModel().query().orderBy('name', 'asc');
  }

  public async getUnit(unitId: number) {
    const unit = await this.itemUnitModel().query().findById(unitId);

    if (!unit) throw new NotFoundException();

    return unit;
  }

  public async createUnit(unitDto: CreateItemUnitDto) {
    await this.validateNameUnique(unitDto.name);

    return this.itemUnitModel()
      .query()
      .insertAndFetch({
        name: unitDto.name,
        symbol: unitDto.symbol ?? null,
        active: unitDto.active ?? true,
      });
  }

  public async editUnit(unitId: number, unitDto: EditItemUnitDto) {
    await this.getUnit(unitId);
    await this.validateNameUnique(unitDto.name, unitId);

    return this.itemUnitModel()
      .query()
      .patchAndFetchById(unitId, {
        name: unitDto.name,
        symbol: unitDto.symbol ?? null,
        active: unitDto.active ?? true,
      });
  }

  /**
   * A unit an item still points at cannot be deleted: the quantities on that
   * item would stop meaning anything. The caller is told which items hold it
   * so they can be changed first.
   */
  public async deleteUnit(unitId: number) {
    await this.getUnit(unitId);

    const usedBy = await this.itemModel()
      .query()
      .where('unitId', unitId)
      .orWhere('secondaryUnitId', unitId)
      .resultSize();

    if (usedBy > 0) {
      throw new ServiceError(ERRORS.UNIT_IN_USE, null, { usedBy });
    }
    await this.itemUnitModel().query().deleteById(unitId);
  }

  private async validateNameUnique(name: string, exceptId?: number) {
    const query = this.itemUnitModel().query().where('name', name);

    if (exceptId) query.whereNot('id', exceptId);

    if (await query.first()) {
      throw new ServiceError(ERRORS.UNIT_NAME_NOT_UNIQUE);
    }
  }
}
