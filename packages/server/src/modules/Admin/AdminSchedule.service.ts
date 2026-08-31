import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { AdminBackupService } from './AdminBackup.service';
import { AdminDataService } from './AdminData.service';

/**
 * Twice a day, unattended: the whole installation, then every organization.
 *
 * At noon and midnight **Tehran time**, not the container's. The image carries
 * no timezone and so runs on UTC, which would have put "midnight" at half past
 * three in the afternoon for the person reading the list. The zone is stated
 * here rather than by setting `TZ`, so that changing it cannot quietly move
 * every timestamp elsewhere in the application.
 *
 * Automatic archives are named apart from the ones a person asked for, so
 * pruning can only ever reach its own.
 */
export const AUTOMATIC_MARKER = 'auto';

/** How many of each kind to keep. Twice a day, so a fortnight of history. */
const KEEP_PER_KIND = 28;

const TIME_ZONE = 'Asia/Tehran';

@Injectable()
export class AdminScheduleService {
  private readonly logger = new Logger('AdminPortal');
  private running = false;

  constructor(
    private readonly backups: AdminBackupService,
    private readonly data: AdminDataService,
    private readonly registry: SchedulerRegistry,
  ) {}

  /**
   * When each job fires next, read from the scheduler itself rather than
   * recomputed here — so the page shows what is actually armed, and an
   * expression that failed to register shows up as missing instead of as a
   * time that will never arrive.
   */
  public nextRuns(): Array<{ name: string; at: string | null }> {
    return ['pashiz-backup-noon', 'pashiz-backup-midnight'].map((name) => {
      try {
        const job = this.registry.getCronJob(name);
        const next = job.nextDate();

        return {
          name,
          at: next
            ? new Date(next.toMillis?.() ?? (next as any)).toISOString()
            : null,
        };
      } catch {
        return { name, at: null };
      }
    });
  }

  @Cron('0 0 12 * * *', { timeZone: TIME_ZONE, name: 'pashiz-backup-noon' })
  async atNoon() {
    await this.runAll();
  }

  @Cron('0 0 0 * * *', { timeZone: TIME_ZONE, name: 'pashiz-backup-midnight' })
  async atMidnight() {
    await this.runAll();
  }

  /**
   * One run: the databases, then each organization on its own.
   *
   * Both, rather than only the whole-installation dump, because they answer
   * different questions. The dump puts everything back as it was; a
   * per-organization file moves one set of books to another installation, and
   * is the only one of the two an operator can hand to a single customer.
   *
   * A failure anywhere is logged and the run continues: one unreadable
   * organization must not cost the other eleven their backup.
   */
  public async runAll(): Promise<void> {
    if (this.running) {
      this.logger.warn(
        'Scheduled backup skipped — the previous one is still going.',
      );
      return;
    }
    this.running = true;
    const startedAt = Date.now();

    try {
      await this.runInstallation();
      await this.runOrganizations();
      await this.prune();

      this.logger.log(
        `Scheduled backup finished in ${Math.round((Date.now() - startedAt) / 1000)}s.`,
      );
    } finally {
      this.running = false;
    }
  }

  private async runInstallation(): Promise<void> {
    try {
      await this.backups.runNow(AUTOMATIC_MARKER);
    } catch (error: any) {
      this.logger.error(
        `Scheduled installation backup failed: ${error?.message}`,
      );
    }
  }

  private async runOrganizations(): Promise<void> {
    let organizations: Array<{ id: number; name: string }> = [];
    try {
      organizations = (await this.data.getOrganizations()) as any;
    } catch (error: any) {
      this.logger.error(`Could not list organizations: ${error?.message}`);
      return;
    }

    for (const organization of organizations) {
      try {
        const { filename, content } = await this.data.exportOrganization(
          organization.id,
        );
        await this.backups.save(filename, content, AUTOMATIC_MARKER);
      } catch (error: any) {
        this.logger.error(
          `Scheduled backup of organization ${organization.id} failed: ${error?.message}`,
        );
      }
    }
  }

  /**
   * Keeps the newest of each kind and removes the rest — but only ever among
   * the automatic ones. An archive a person took deliberately stays until that
   * person deletes it.
   */
  private async prune(): Promise<void> {
    try {
      const removed = await this.backups.pruneAutomatic(KEEP_PER_KIND);
      if (removed) this.logger.log(`Pruned ${removed} old automatic archives.`);
    } catch (error: any) {
      this.logger.error(`Pruning failed: ${error?.message}`);
    }
  }
}
