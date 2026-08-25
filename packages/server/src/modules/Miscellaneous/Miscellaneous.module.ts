import { Module } from '@nestjs/common';
import { GetDateFormatsService } from './queries/GetDateFormats.service';
import { MiscellaneousController } from './Miscellaneous.controller';
import { TenancyModule } from '../Tenancy/Tenancy.module';

@Module({
  imports: [TenancyModule],
  providers: [GetDateFormatsService],
  exports: [GetDateFormatsService],
  controllers: [MiscellaneousController],
})
export class MiscellaneousModule {}
