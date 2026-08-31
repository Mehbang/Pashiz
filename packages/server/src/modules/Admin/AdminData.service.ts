import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knexFactory, { Knex } from 'knex';
import { knexSnakeCaseMappers } from 'objection';
import { gzip } from 'zlib';
import { promisify } from 'util';
import { SystemUser } from '@/modules/System/models/SystemUser';
import { TenantModel } from '@/modules/System/models/TenantModel';
import { UserTenant } from '@/modules/System/models/UserTenant.model';
import { ExportOrganizationService } from '@/modules/OrganizationBackup/commands/ExportOrganization.service';
import { ImportOrganizationService } from '@/modules/OrganizationBackup/commands/ImportOrganization.service';

const gzipAsync = promisify(gzip);

export interface AdminUserRow {
  id: number;
  email: string;
  name: string;
  active: boolean;
  verified: boolean;
  createdAt: string | null;
  organizationCount: number;
}

export interface AdminOrganizationRow {
  id: number;
  organizationId: string;
  name: string;
  baseCurrency: string | null;
  language: string | null;
  initialized: boolean;
  createdAt: string | null;
  ownerEmail: string | null;
}

/**
 * Reads across the whole installation on the portal's behalf.
 *
 * Every other service here is scoped to one organization by the request. This
 * one is not, so it opens its own connection per organization and closes it
 * again — it must never reuse the request-scoped pool, which belongs to
 * whatever organization the caller was in, and the portal is in none.
 */
@Injectable()
export class AdminDataService {
  constructor(
    private readonly configService: ConfigService,
    private readonly exportService: ExportOrganizationService,
    private readonly importService: ImportOrganizationService,

    @Inject(SystemUser.name)
    private readonly systemUserModel: typeof SystemUser,

    @Inject(TenantModel.name)
    private readonly tenantModel: typeof TenantModel,

    @Inject(UserTenant.name)
    private readonly userTenantModel: typeof UserTenant,
  ) {}

  public async getUsers(): Promise<AdminUserRow[]> {
    const users = await this.systemUserModel.query().orderBy('id');
    const memberships = await this.userTenantModel.query();

    const counts = new Map<number, number>();
    for (const membership of memberships) {
      counts.set(membership.userId, (counts.get(membership.userId) ?? 0) + 1);
    }

    return users.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim(),
      active: Boolean(user.active),
      verified: Boolean(user.verified ?? user.inviteAcceptedAt),
      createdAt: this.iso(user.createdAt),
      organizationCount: counts.get(user.id) ?? 0,
    }));
  }

  public async getOrganizations(): Promise<AdminOrganizationRow[]> {
    const tenants = await this.tenantModel
      .query()
      .withGraphFetched('metadata')
      .orderBy('id');

    const memberships = await this.userTenantModel.query();
    const users = await this.systemUserModel.query();
    const emailById = new Map(users.map((user: any) => [user.id, user.email]));

    const ownerByTenant = new Map<number, string>();
    for (const membership of memberships) {
      if (!ownerByTenant.has(membership.tenantId)) {
        ownerByTenant.set(
          membership.tenantId,
          emailById.get(membership.userId) ?? '',
        );
      }
    }

    return tenants.map((tenant: any) => ({
      id: tenant.id,
      organizationId: tenant.organizationId,
      name: tenant.metadata?.name ?? '',
      baseCurrency: tenant.metadata?.baseCurrency ?? null,
      language: tenant.metadata?.language ?? null,
      initialized: Boolean(tenant.initializedAt),
      createdAt: this.iso(tenant.createdAt),
      ownerEmail: ownerByTenant.get(tenant.id) ?? null,
    }));
  }

  /**
   * One organization, as the same `.pashiz` file the settings page produces.
   */
  public async exportOrganization(
    tenantId: number,
  ): Promise<{ filename: string; content: Buffer }> {
    const tenant = await this.tenantModel
      .query()
      .findById(tenantId)
      .withGraphFetched('metadata')
      .throwIfNotFound();

    const knex = this.connectTo((tenant as any).organizationId);
    try {
      return await this.exportService.exportTenant(
        knex,
        ((tenant as any).metadata ?? {}) as Record<string, any>,
      );
    } finally {
      await knex.destroy();
    }
  }

  /**
   * Everything one person has, in a single file.
   *
   * A bundle rather than a `.pashiz`: it holds one entry per organization that
   * person belongs to, each entry being exactly the file the per-organization
   * export produces. Importing it is therefore a matter of choosing which
   * organization each entry should land in, which only a human can decide —
   * so the bundle is a deliberate archive format, not something the import
   * screen accepts.
   */
  public async exportUser(
    userId: number,
  ): Promise<{ filename: string; content: Buffer }> {
    const user = await this.systemUserModel
      .query()
      .findById(userId)
      .throwIfNotFound();

    const memberships = await this.userTenantModel
      .query()
      .where('userId', userId);
    const tenantIds = memberships.map((membership) => membership.tenantId);

    const organizations = [];
    for (const tenantId of tenantIds) {
      const tenant = await this.tenantModel
        .query()
        .findById(tenantId)
        .withGraphFetched('metadata');

      if (!tenant || !(tenant as any).initializedAt) continue;

      const knex = this.connectTo((tenant as any).organizationId);
      try {
        const { content } = await this.exportService.exportTenant(
          knex,
          ((tenant as any).metadata ?? {}) as Record<string, any>,
        );
        organizations.push({
          organizationId: (tenant as any).organizationId,
          name: (tenant as any).metadata?.name ?? '',
          // The per-organization export is already gzipped; base64 keeps it
          // intact inside this envelope.
          backup: content.toString('base64'),
        });
      } finally {
        await knex.destroy();
      }
    }

    const bundle = {
      format: 1,
      app: 'pashiz',
      kind: 'user-bundle',
      exportedAt: new Date().toISOString(),
      user: {
        email: (user as any).email,
        name: [(user as any).firstName, (user as any).lastName]
          .filter(Boolean)
          .join(' ')
          .trim(),
      },
      organizations,
    };
    const content = await gzipAsync(Buffer.from(JSON.stringify(bundle)));
    const slug = ((user as any).email ?? 'user').split('@')[0];

    return {
      filename: `pashiz-user-${slug}-${new Date().toISOString().slice(0, 10)}.pashizbundle`,
      content,
    };
  }

  /**
   * Puts an organization export back into a chosen organization.
   *
   * The rows record who made them by an id that means nothing here, so they
   * are repointed at the organization's own owner — the person who will be
   * looking at them. Where an organization has no owner on this installation,
   * the import is refused rather than left pointing at nobody.
   */
  public async importOrganization(
    tenantId: number,
    file: Buffer,
    entryIndex?: number,
  ): Promise<void> {
    const tenant = await this.tenantModel
      .query()
      .findById(tenantId)
      .throwIfNotFound();

    const membership = await this.userTenantModel
      .query()
      .where('tenantId', tenantId)
      .first();

    if (!membership) {
      throw new Error('این سازمان صاحبی روی این نصب ندارد.');
    }
    const owner = await this.systemUserModel
      .query()
      .findById((membership as any).userId)
      .throwIfNotFound();

    const backup = await this.importService.parseBackup(file, entryIndex);
    const knex = this.connectTo((tenant as any).organizationId);

    try {
      await this.importService.importInto(knex, tenantId, owner as any, backup);
    } finally {
      await knex.destroy();
    }
  }

  /**
   * A connection to one organization's database, outside the request-scoped
   * pool. Every caller closes it — see the `finally` blocks above.
   */
  private connectTo(organizationId: string): Knex {
    return knexFactory({
      client: this.configService.get('tenantDatabase.client'),
      connection: {
        host: this.configService.get('tenantDatabase.host'),
        port: this.configService.get('tenantDatabase.port'),
        user: this.configService.get('tenantDatabase.user'),
        password: this.configService.get('tenantDatabase.password'),
        database: `${this.configService.get('tenantDatabase.dbNamePrefix')}${organizationId}`,
        charset: 'utf8',
      },
      pool: { min: 0, max: 2 },
      ...knexSnakeCaseMappers({ upperCase: true }),
    });
  }

  private iso(value: unknown): string | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(String(value));

    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
}
