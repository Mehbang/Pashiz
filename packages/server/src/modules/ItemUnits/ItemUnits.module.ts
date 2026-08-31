import { Module } from '@nestjs/common';
import { TenancyDatabaseModule } from '../Tenancy/TenancyDB/TenancyDB.module';
import { TenancyModule } from '../Tenancy/Tenancy.module';
import { ItemUnitsController } from './ItemUnits.controller';
import { ItemUnitsService } from './ItemUnits.service';

@Module({
  imports: [TenancyModule, TenancyDatabaseModule],
  controllers: [ItemUnitsController],
  providers: [ItemUnitsService],
  exports: [ItemUnitsService],
})
export class ItemUnitsModule {}
