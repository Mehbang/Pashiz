import { Global, Module, forwardRef } from '@nestjs/common';
import { AdminController } from './Admin.controller';
import { AdminAuthService } from './AdminAuth.service';
import { AdminBackupService } from './AdminBackup.service';
import { AdminScheduleService } from './AdminSchedule.service';
import { AdminDataService } from './AdminData.service';
import { AdminPortalGuard } from './AdminPortal.guard';
import { InstanceSettingsService } from './InstanceSettings.service';
import { OrganizationBackupModule } from '@/modules/OrganizationBackup/OrganizationBackup.module';
import { MailModule } from '@/modules/Mail/Mail.module';

/**
 * The administration portal, and the instance-wide settings it edits.
 *
 * Global because `InstanceSettingsService` is what signup and mail now consult
 * instead of reading the environment directly, and both live far from here.
 */
@Global()
@Module({
  imports: [
    forwardRef(() => OrganizationBackupModule),
    forwardRef(() => MailModule),
  ],
  controllers: [AdminController],
  providers: [
    AdminAuthService,
    AdminBackupService,
    AdminScheduleService,
    AdminDataService,
    AdminPortalGuard,
    InstanceSettingsService,
  ],
  exports: [InstanceSettingsService, AdminAuthService],
})
export class AdminModule {}
