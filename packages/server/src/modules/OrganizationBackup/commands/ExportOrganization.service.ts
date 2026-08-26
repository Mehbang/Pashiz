import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { gzip } from 'zlib';
import { promisify } from 'util';
import { Knex } from 'knex';
import { ServiceError } from '@/modules/Items/ServiceError';
import { TENANCY_DB_CONNECTION } from '@/modules/Tenancy/TenancyDB/TenancyDB.constants';
import { TenancyContext } from '@/modules/Tenancy/TenancyContext.service';
import { S3_CLIENT } from '@/modules/S3/S3.module';
import {
  EXCLUDED_TABLES,
  ERRORS,
  ORGANIZATION_BACKUP_FORMAT,
  OrganizationBackup,
  OrganizationBackupAttachment,
  toCamelTableName,
} from '../OrganizationBackup.types';

const gzipAsync = promisify(gzip);

/**
 * Attachments travel inside the file as base64, so the whole export is
 * assembled in memory. That suits the volume a small business accumulates and
 * not a large one, so it is capped rather than left to exhaust the server.
 */
const MAX_ATTACHMENTS_BYTES = 100 * 1024 * 1024;

@Injectable()
export class ExportOrganizationService {
  constructor(
    private readonly tenancyContext: TenancyContext,
    private readonly configService: ConfigService,

    @Inject(TENANCY_DB_CONNECTION)
    private readonly tenantKnex: () => Knex,

    @Inject(S3_CLIENT)
    private readonly s3: S3Client,
  ) {}

  /**
   * Packs the current organization into a single gzipped file.
   */
  public async export(): Promise<{ filename: string; content: Buffer }> {
    const tenant = await this.tenancyContext.getTenant(true);

    return this.exportTenant(
      this.tenantKnex(),
      (tenant.metadata ?? {}) as Record<string, any>,
    );
  }

  /**
   * The same export for an organization other than the request's own.
   *
   * The administration portal works across the whole installation and has no
   * organization in context, so it supplies the connection and the metadata
   * rather than having them resolved from the request.
   */
  public async exportTenant(
    knex: Knex,
    metadata: Record<string, any>,
  ): Promise<{ filename: string; content: Buffer }> {
    const tables = await this.readTables(knex);
    const attachments = await this.readAttachments(tables);

    const backup: OrganizationBackup = {
      format: ORGANIZATION_BACKUP_FORMAT,
      app: 'pashiz',
      exportedAt: new Date().toISOString(),
      organization: {
        name: metadata.name,
        baseCurrency: metadata.baseCurrency,
        language: metadata.language,
        timezone: metadata.timezone,
        dateFormat: metadata.dateFormat,
        fiscalYear: metadata.fiscalYear,
        industry: metadata.industry,
        taxNumber: metadata.taxNumber,
        location: metadata.location,
        address: metadata.address,
      },
      tables,
      attachments,
    };
    const content = await gzipAsync(Buffer.from(JSON.stringify(backup)));

    return { filename: this.filename(metadata.name), content };
  }

  /**
   * A filename that names the organization and the day, and still saves on any
   * filesystem — the organization name is usually Persian.
   */
  private filename(organizationName?: string): string {
    const slug = (organizationName || 'organization')
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);

    return `pashiz-${slug}-${new Date().toISOString().slice(0, 10)}.pashiz`;
  }

  /**
   * Every table in the tenant database, as raw rows rather than models: the
   * export is a copy of what is stored, without the virtual attributes and
   * formatting a model layers on top.
   */
  private async readTables(
    knex: Knex,
  ): Promise<Record<string, Array<Record<string, unknown>>>> {
    const database = (knex.client.config.connection as any).database;

    const result = await knex.raw(
      `SELECT TABLE_NAME AS name FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'`,
      [database],
    );
    const rows = (Array.isArray(result) ? result[0] : result) as Array<{
      name: string;
    }>;
    const tables: Record<string, Array<Record<string, unknown>>> = {};

    for (const { name } of rows) {
      const table = toCamelTableName(name);
      if (EXCLUDED_TABLES.includes(table)) continue;

      const rows = await knex.select('*').from(table);
      tables[table] = rows.map((row: Record<string, unknown>) =>
        this.serializeRow(row),
      );
    }
    return tables;
  }

  /**
   * The driver hands back `DATETIME` columns as `Date` objects, and JSON turns
   * those into ISO-8601 with a `Z`, which MySQL then refuses on the way back in
   * — `Incorrect date value`. They are written in the shape the column accepts
   * instead, using the same local calendar the driver read them in, so the
   * value round-trips rather than shifting by the offset.
   */
  private serializeRow(row: Record<string, unknown>): Record<string, unknown> {
    const serialized: Record<string, unknown> = {};

    for (const [column, value] of Object.entries(row)) {
      if (value instanceof Date) {
        const pad = (n: number) => String(n).padStart(2, '0');
        serialized[column] =
          `${value.getFullYear()}-${pad(value.getMonth() + 1)}-` +
          `${pad(value.getDate())} ${pad(value.getHours())}:` +
          `${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
      } else if (Buffer.isBuffer(value)) {
        serialized[column] = value.toString('base64');
      } else {
        serialized[column] = value;
      }
    }
    return serialized;
  }

  /**
   * The files the rows point at. Their bytes live in the object store, so a
   * copy of the database alone would restore invoices whose attachments had
   * all vanished.
   */
  private async readAttachments(
    tables: Record<string, Array<Record<string, unknown>>>,
  ): Promise<OrganizationBackupAttachment[]> {
    const documents = (tables['documents'] ?? []) as Array<Record<string, any>>;
    if (!documents.length) return [];

    const bucket = this.configService.get('s3.bucket');
    if (!bucket) return [];

    const attachments: OrganizationBackupAttachment[] = [];
    let total = 0;

    for (const document of documents) {
      const key = document.key;
      if (!key) continue;

      let buffer: Buffer;
      try {
        const object = await this.s3.send(
          new GetObjectCommand({ Bucket: bucket, Key: key }),
        );
        const chunks: Buffer[] = [];
        for await (const chunk of object.Body as any) chunks.push(chunk);
        buffer = Buffer.concat(chunks);
      } catch {
        // One unreadable object must not cost the whole export. The row stays
        // in the backup; only the file is missing from it.
        continue;
      }

      total += buffer.length;
      if (total > MAX_ATTACHMENTS_BYTES) {
        throw new ServiceError(ERRORS.ATTACHMENTS_TOO_LARGE);
      }
      attachments.push({
        key,
        mimeType: document.mimeType,
        data: buffer.toString('base64'),
      });
    }
    return attachments;
  }
}
