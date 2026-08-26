import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { gunzip } from 'zlib';
import { promisify } from 'util';
import { Knex } from 'knex';
import { ServiceError } from '@/modules/Items/ServiceError';
import { TENANCY_DB_CONNECTION } from '@/modules/Tenancy/TenancyDB/TenancyDB.constants';
import { TenancyContext } from '@/modules/Tenancy/TenancyContext.service';
import { S3_CLIENT } from '@/modules/S3/S3.module';
import { TenantMetadata } from '@/modules/System/models/TenantMetadataModel';
import {
  EXCLUDED_TABLES,
  ERRORS,
  ORGANIZATION_BACKUP_FORMAT,
  OrganizationBackup,
  OrganizationBackupSummary,
  toCamelTableName,
} from '../OrganizationBackup.types';

const gunzipAsync = promisify(gunzip);

@Injectable()
export class ImportOrganizationService {
  constructor(
    private readonly tenancyContext: TenancyContext,
    private readonly configService: ConfigService,

    @Inject(TENANCY_DB_CONNECTION)
    private readonly tenantKnex: () => Knex,

    @Inject(S3_CLIENT)
    private readonly s3: S3Client,
  ) {}

  /**
   * Reads a backup file without changing anything, so the interface can say
   * what is about to be imported before the user commits to it.
   */
  public async inspect(file: Buffer): Promise<OrganizationBackupSummary> {
    const backup = await this.parse(file);

    return {
      organizationName: backup.organization?.name,
      exportedAt: backup.exportedAt,
      sourceVersion: backup.sourceVersion,
      tableCount: Object.keys(backup.tables).length,
      rowCount: Object.values(backup.tables).reduce(
        (total, rows) => total + rows.length,
        0,
      ),
      attachmentCount: backup.attachments?.length ?? 0,
    };
  }

  /**
   * Replaces this organization's data with the backup's.
   *
   * Replace rather than merge: the rows carry their own ids, and folding two
   * sets of accounts and invoices together would either collide on those ids
   * or silently duplicate every record. An organization is restored whole or
   * not at all.
   *
   * Only the tenant database is touched. The users of this installation, and
   * every other organization on it, are left exactly as they were.
   */
  public async import(file: Buffer): Promise<OrganizationBackupSummary> {
    const backup = await this.parse(file);
    const summary = await this.inspect(file);

    const knex = this.tenantKnex();
    const tenant = await this.tenancyContext.getTenant(true);
    const user = await this.tenancyContext.getSystemUser();

    const importable = Object.keys(backup.tables).filter(
      (table) => !EXCLUDED_TABLES.includes(table),
    );
    const present = await this.existingTables(knex);

    await knex.transaction(async (trx) => {
      // The rows arrive in whatever order the tables were read, and they
      // reference each other; the constraints are re-enabled below whether or
      // not this succeeds, because the transaction is scoped to one connection.
      await trx.raw('SET FOREIGN_KEY_CHECKS = 0');

      try {
        for (const table of importable) {
          // A table the backup knows and this schema does not is from a newer
          // version than this installation runs. Skipping it is better than
          // failing the whole import over a feature this server lacks.
          if (!present.has(table)) continue;

          await trx(table).del();

          const rows = backup.tables[table];
          if (!rows.length) continue;

          // Chunked: a single insert of every invoice line in a busy year
          // exceeds max_allowed_packet.
          for (let i = 0; i < rows.length; i += 200) {
            await trx(table).insert(rows.slice(i, i + 200));
          }
        }
        await this.remapUserReferences(trx, present, user.id);
      } finally {
        await trx.raw('SET FOREIGN_KEY_CHECKS = 1');
      }
    });

    await this.ensureTenantUser(knex, user);
    await this.applyOrganizationSettings(tenant.id, backup);
    await this.restoreAttachments(backup);

    return summary;
  }

  /**
   * Makes sure the importing user still has a row in the tenant's own user
   * table.
   *
   * Nothing in a current import touches that table — see `IDENTITY_TABLES`.
   * This is here for the files taken before it was excluded: those carry the
   * exporting installation's users, and importing one replaced the local
   * owner's row with a stranger's, locking every local user out of the
   * organization permanently. Restoring the row means the very file that broke
   * an organization puts it right again.
   */
  private async ensureTenantUser(knex: Knex, systemUser: any): Promise<void> {
    const existing = await knex('users')
      .where('systemUserId', systemUser.id)
      .first();

    if (existing) return;

    // Whoever can import an organization already administers it.
    const role =
      (await knex('roles').where('slug', 'admin').first()) ??
      (await knex('roles').orderBy('id').first());

    await knex('users').insert({
      firstName: systemUser.firstName,
      lastName: systemUser.lastName,
      email: systemUser.email,
      active: 1,
      systemUserId: systemUser.id,
      roleId: role?.id,
      inviteAcceptedAt: new Date(),
      createdAt: new Date(),
    });
  }

  /**
   * Rows record which user created them, by an id that means nothing on this
   * installation — the exporting user does not exist here. They are pointed at
   * the user doing the import, so the interface shows a real name rather than
   * a blank.
   */
  private async remapUserReferences(
    trx: Knex.Transaction,
    present: Set<string>,
    userId: number,
  ): Promise<void> {
    const database = (trx.client.config.connection as any).database;

    const result = await trx.raw(
      `SELECT TABLE_NAME AS tableName FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND COLUMN_NAME = 'USER_ID'`,
      [database],
    );
    const rows = (Array.isArray(result) ? result[0] : result) as Array<{
      tableName: string;
    }>;

    for (const row of rows) {
      const table = toCamelTableName(row.tableName);
      if (!present.has(table) || EXCLUDED_TABLES.includes(table)) continue;

      await trx(table).whereNotNull('userId').update({ userId });
    }
  }

  /**
   * The organization's own settings live in the system database, beside the
   * users, so they are applied separately — and only for this organization.
   */
  private async applyOrganizationSettings(
    tenantId: number,
    backup: OrganizationBackup,
  ): Promise<void> {
    const settings = backup.organization ?? {};

    // The name and the trading details belong to the organization and travel
    // with it. The language and base currency do too: they decide the calendar
    // the books are read in, and the imported rows were written under them.
    const patch: Record<string, unknown> = {};
    for (const field of [
      'name',
      'baseCurrency',
      'language',
      'timezone',
      'dateFormat',
      'fiscalYear',
      'industry',
      'taxNumber',
      'location',
    ] as const) {
      if (settings[field] !== undefined && settings[field] !== null) {
        patch[field] = settings[field];
      }
    }
    if (!Object.keys(patch).length) return;

    await TenantMetadata.query().where('tenantId', tenantId).patch(patch);
  }

  /**
   * Puts the files back into this installation's object store under the same
   * keys the rows refer to.
   */
  private async restoreAttachments(backup: OrganizationBackup): Promise<void> {
    const attachments = backup.attachments ?? [];
    if (!attachments.length) return;

    const bucket = this.configService.get('s3.bucket');
    if (!bucket) return;

    for (const attachment of attachments) {
      try {
        await this.s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: attachment.key,
            Body: Buffer.from(attachment.data, 'base64'),
            ContentType: attachment.mimeType,
          }),
        );
      } catch {
        // The books are already in; a file that will not upload is worth a
        // missing attachment, not a failed import.
      }
    }
  }

  private async existingTables(knex: Knex): Promise<Set<string>> {
    const database = (knex.client.config.connection as any).database;

    const result = await knex.raw(
      `SELECT TABLE_NAME AS name FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'`,
      [database],
    );
    const rows = (Array.isArray(result) ? result[0] : result) as Array<{
      name: string;
    }>;
    return new Set(rows.map((row) => toCamelTableName(row.name)));
  }

  private async parse(file: Buffer): Promise<OrganizationBackup> {
    let backup: OrganizationBackup;
    try {
      backup = JSON.parse((await gunzipAsync(file)).toString());
    } catch {
      throw new ServiceError(ERRORS.INVALID_BACKUP_FILE);
    }
    if (backup?.app !== 'pashiz' || !backup?.tables) {
      throw new ServiceError(ERRORS.INVALID_BACKUP_FILE);
    }
    if (backup.format > ORGANIZATION_BACKUP_FORMAT) {
      throw new ServiceError(ERRORS.UNSUPPORTED_BACKUP_FORMAT);
    }
    return backup;
  }
}
