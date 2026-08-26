import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, readdir, stat, rm } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { createGzip } from 'node:zlib';

export interface BackupFile {
  name: string;
  sizeBytes: number;
  createdAt: string;
}

export type BackupState =
  | { status: 'idle' }
  | { status: 'running'; startedAt: string }
  | { status: 'done'; finishedAt: string; name: string }
  | { status: 'failed'; finishedAt: string; message: string };

/**
 * Whole-installation backups, taken from inside the server.
 *
 * `update.sh backup` does the same job from the host and remains the more
 * complete of the two — it can also stop the object store to capture its
 * volume at rest, which a process inside a container cannot. This exists so
 * the operator can take one without a shell, and writes into the same
 * directory, so both show up in one list.
 *
 * Deliberately excluded, exactly as in the script: the `mysql` grants
 * database, because restoring it replaces the target's own accounts and
 * invalidates the password its `.env` holds.
 */
@Injectable()
export class AdminBackupService {
  private readonly logger = new Logger('AdminPortal');
  private state: BackupState = { status: 'idle' };

  constructor(private readonly configService: ConfigService) {}

  public getState(): BackupState {
    return this.state;
  }

  private get directory(): string {
    return process.env.PASHIZ_BACKUP_DIR || '/app/backups';
  }

  /**
   * Only ever a plain filename this service could itself have written. Guards
   * the download route against being talked into reading elsewhere on disk.
   */
  private isSafeName(name: string): boolean {
    return (
      /^[A-Za-z0-9._-]+\.(tar\.gz|sql\.gz)$/.test(name) &&
      basename(name) === name
    );
  }

  public async list(): Promise<BackupFile[]> {
    try {
      const names = await readdir(this.directory);
      const files: BackupFile[] = [];

      for (const name of names) {
        if (!this.isSafeName(name)) continue;

        const info = await stat(join(this.directory, name));
        if (!info.isFile()) continue;

        files.push({
          name,
          sizeBytes: info.size,
          createdAt: info.mtime.toISOString(),
        });
      }
      return files.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch {
      // No directory yet simply means no backup has been taken.
      return [];
    }
  }

  public resolveForDownload(name: string): string | null {
    if (!this.isSafeName(name)) return null;

    return join(this.directory, name);
  }

  public async remove(name: string): Promise<boolean> {
    const path = this.resolveForDownload(name);
    if (!path) return false;

    await rm(path, { force: true });
    return true;
  }

  /**
   * Starts a backup and returns immediately.
   *
   * A dump of every organization on a busy installation takes minutes, which
   * is far longer than a request should be held open, so the portal starts it
   * and then reports on it. One at a time: two concurrent dumps would compete
   * for the same database and the same disk.
   */
  public start(): { started: boolean; reason?: string } {
    if (this.state.status === 'running') {
      return { started: false, reason: 'already-running' };
    }
    this.state = { status: 'running', startedAt: new Date().toISOString() };

    void this.run().catch((error) => {
      this.state = {
        status: 'failed',
        finishedAt: new Date().toISOString(),
        message: this.explain(error),
      };
      this.logger.error(`Backup failed: ${error?.message}`);
    });
    return { started: true };
  }

  /**
   * Turns what the client printed into something an operator can act on.
   *
   * `spawn mysql ENOENT` and a socket path nobody configured are precise and
   * useless; both have one obvious cause and one obvious remedy.
   */
  private explain(error: any): string {
    const message = String(error?.message ?? 'unknown error');

    if (error?.code === 'ENOENT' || message.includes('ENOENT')) {
      return (
        'ابزار mysqldump روی این نصب پیدا نشد. ' +
        'این ابزار در ایمیج رسمی پشیز هست؛ اگر سرور را دستی و بیرون از داکر ' +
        'بالا آورده‌اید، بستهٔ mariadb-client را نصب کنید.'
      );
    }
    if (message.includes('mysqld.sock') || message.includes("Can't connect")) {
      return (
        'اتصال به پایگاه‌داده برقرار نشد. ' +
        'مقدار DB_HOST باید نام سرویس پایگاه‌داده باشد (mysql)، نه localhost. ' +
        `پیام اصلی: ${message}`
      );
    }
    if (message.includes('Access denied')) {
      return `پایگاه‌داده اجازهٔ دسترسی نداد. کاربر یا رمز DB_USER/DB_PASSWORD را بررسی کنید. پیام اصلی: ${message}`;
    }
    return message;
  }

  private async run(): Promise<void> {
    await mkdir(this.directory, { recursive: true });

    const stamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\..+$/, '');
    const name = `pashiz-portal-${stamp}.sql.gz`;
    const target = join(this.directory, name);

    const host = this.configService.get('systemDatabase.host');
    const port = String(this.configService.get('systemDatabase.port') ?? 3306);
    const user = this.configService.get('systemDatabase.user');
    const password = this.configService.get('systemDatabase.password');

    const databases = await this.listDatabases(host, port, user, password);
    if (!databases.length) throw new Error('no pashiz databases found');

    await this.dump(target, host, port, user, password, databases);

    this.state = {
      status: 'done',
      finishedAt: new Date().toISOString(),
      name,
    };
    this.logger.log(`Backup written: ${name} (${databases.length} databases)`);
  }

  private listDatabases(
    host: string,
    port: string,
    user: string,
    password: string,
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const child = spawn(
        'mysql',
        [
          `--host=${host}`,
          `--port=${port}`,
          `--user=${user}`,
          '--skip-column-names',
          '--batch',
          '-e',
          "SHOW DATABASES LIKE 'bigcapital%'",
        ],
        // The password travels in the environment, never in the argument list,
        // where every other process on the machine could read it.
        { env: { ...process.env, MYSQL_PWD: password } },
      );
      let out = '';
      let err = '';
      child.stdout.on('data', (chunk) => (out += chunk));
      child.stderr.on('data', (chunk) => (err += chunk));
      child.on('error', reject);
      child.on('close', (code) =>
        code === 0
          ? resolve(
              out
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean),
            )
          : reject(new Error(err.trim() || `mysql exited ${code}`)),
      );
    });
  }

  private dump(
    target: string,
    host: string,
    port: string,
    user: string,
    password: string,
    databases: string[],
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(
        'mysqldump',
        [
          `--host=${host}`,
          `--port=${port}`,
          `--user=${user}`,
          '--single-transaction',
          '--quick',
          '--routines',
          '--events',
          '--databases',
          ...databases,
        ],
        { env: { ...process.env, MYSQL_PWD: password } },
      );
      const out = createWriteStream(target, { mode: 0o600 });
      const gzipStream = createGzip();

      let err = '';
      child.stderr.on('data', (chunk) => (err += chunk));
      child.on('error', reject);
      out.on('error', reject);

      child.stdout.pipe(gzipStream).pipe(out);

      out.on('finish', () => resolve());
      child.on('close', (code) => {
        if (code !== 0)
          reject(new Error(err.trim() || `mysqldump exited ${code}`));
      });
    });
  }
}
