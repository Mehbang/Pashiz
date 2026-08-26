import { Command, Option } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseCommand } from './BaseCommand';

interface RepairUsersOptions {
  prune?: boolean;
}

/**
 * Puts back the tenant-side user rows that an organization needs in order to
 * load at all.
 *
 * Every tenant database mirrors the system users in a `users` table of its
 * own, keyed by `systemUserId`. That row is written once, when the
 * organization is built, and never again — so anything that removes it locks
 * the organization out for good: the authorization guard cannot resolve an
 * ability, every authorized endpoint fails, and the application renders
 * nothing at all. Organization backups taken before the user tables were
 * excluded from them did exactly that.
 *
 * A locked-out organization cannot be repaired from the interface, because the
 * interface is one of the things that stops working. Hence a command.
 */
@Injectable()
@Command({
  name: 'tenants:repair-users',
  description:
    "Restores tenant user rows for each organization's own system users.",
})
export class TenantsRepairUsersCommand extends BaseCommand {
  constructor(configService: ConfigService) {
    super(configService);
  }

  @Option({
    flags: '-p, --prune',
    description:
      'Also delete tenant user rows belonging to no user of this installation.',
  })
  parsePrune(): boolean {
    return true;
  }

  async run(_: string[], options: RepairUsersOptions): Promise<void> {
    const sysKnex = this.initSystemKnex();
    let repaired = 0;
    let pruned = 0;

    try {
      const tenants = await this.getAllInitializedTenants(sysKnex);

      for (const tenant of tenants) {
        const members = await sysKnex('users')
          .join('userTenants', 'userTenants.userId', 'users.id')
          .where('userTenants.tenantId', tenant.id)
          .select('users.*');

        const tenantKnex = this.initTenantKnex(tenant.organizationId);

        try {
          const existing = await tenantKnex('users').select(
            'id',
            'systemUserId',
            'email',
          );
          const known = new Set(existing.map((row) => row.systemUserId));

          for (const member of members) {
            if (known.has(member.id)) continue;

            const role =
              (await tenantKnex('roles').where('slug', 'admin').first()) ??
              (await tenantKnex('roles').orderBy('id').first());

            await tenantKnex('users').insert({
              firstName: member.firstName,
              lastName: member.lastName,
              email: member.email,
              active: 1,
              systemUserId: member.id,
              roleId: role?.id,
              inviteAcceptedAt: new Date(),
              createdAt: new Date(),
            });
            repaired += 1;
            this.log(
              `${tenant.organizationId}: restored ${member.email} (system user ${member.id}).`,
            );
          }

          // Rows left behind by an import from another installation. They name
          // people who cannot sign in here, so they are only ever misleading —
          // but deleting a user row is not something to do unasked.
          const memberIds = new Set(members.map((member) => member.id));
          const strangers = existing.filter(
            (row) => !memberIds.has(row.systemUserId),
          );

          for (const stranger of strangers) {
            if (!options.prune) {
              this.log(
                `${tenant.organizationId}: ${stranger.email} belongs to no user here — rerun with --prune to remove.`,
              );
              continue;
            }
            await tenantKnex('users').where('id', stranger.id).del();
            pruned += 1;
            this.log(`${tenant.organizationId}: removed ${stranger.email}.`);
          }
        } finally {
          await tenantKnex.destroy();
        }
      }
    } catch (error) {
      this.exit(error);
    } finally {
      await sysKnex.destroy();
    }

    this.success(`Done. ${repaired} user row(s) restored, ${pruned} removed.`);
  }
}
