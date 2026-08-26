import { Module } from '@nestjs/common';
import { OrganizationBackupController } from './OrganizationBackup.controller';
import { ExportOrganizationService } from './commands/ExportOrganization.service';
import { ImportOrganizationService } from './commands/ImportOrganization.service';
import { TenancyModule } from '../Tenancy/Tenancy.module';
import { S3Module } from '../S3/S3.module';
import { AuthorizationGuard } from '../Roles/Authorization.guard';

@Module({
  imports: [TenancyModule, S3Module],
  controllers: [OrganizationBackupController],
  providers: [
    ExportOrganizationService,
    ImportOrganizationService,
    AuthorizationGuard,
  ],
  exports: [ExportOrganizationService, ImportOrganizationService],
})
export class OrganizationBackupModule {}
