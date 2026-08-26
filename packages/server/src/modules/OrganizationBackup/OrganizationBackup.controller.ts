import {
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ApiCommonHeaders } from '@/common/decorators/ApiCommonHeaders';
import { AuthorizationGuard } from '@/modules/Roles/Authorization.guard';
import { ExportOrganizationService } from './commands/ExportOrganization.service';
import { ImportOrganizationService } from './commands/ImportOrganization.service';

/**
 * Export and import of one organization's data.
 *
 * Distinct from the instance-level backup that `update.sh` takes: that one
 * moves a whole installation, users included. This moves a single set of books
 * between installations, leaving the users of each where they are.
 */
@Controller('organization/backup')
@ApiTags('Organization backup')
@ApiCommonHeaders()
@UseGuards(AuthorizationGuard)
export class OrganizationBackupController {
  constructor(
    private readonly exportService: ExportOrganizationService,
    private readonly importService: ImportOrganizationService,
  ) {}

  @Get('export')
  @ApiOperation({ summary: "Downloads the organization's data as one file." })
  async exportOrganization(@Res() res: Response) {
    const { filename, content } = await this.exportService.export();

    // An organization name here is normally Persian, and an HTTP header may
    // only carry latin-1. RFC 5987 covers exactly this: an ASCII fallback for
    // clients that want one, and the real name percent-encoded beside it.
    const asciiFallback =
      filename.replace(/[^\x20-\x7E]/g, '') || 'organization.pashiz';

    res.set({
      'Content-Type': 'application/gzip',
      'Content-Length': content.length,
      'Content-Disposition':
        `attachment; filename="${asciiFallback}"; ` +
        `filename*=UTF-8''${encodeURIComponent(filename)}`,
    });
    res.send(content);
  }

  @Post('inspect')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Reads a backup file and reports what it holds, changing nothing.',
  })
  @UseInterceptors(FileInterceptor('file'))
  async inspectBackup(@UploadedFile() file: Express.Multer.File) {
    return this.importService.inspect(file.buffer);
  }

  @Post('import')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: "Replaces the organization's data with the uploaded backup.",
  })
  @UseInterceptors(FileInterceptor('file'))
  async importBackup(@UploadedFile() file: Express.Multer.File) {
    return this.importService.import(file.buffer);
  }
}
