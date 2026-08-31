import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'node:child_process';
import { createReadStream, createWriteStream } from 'node:fs';
import {
  mkdir,
  readdir,
  readFile,
  stat,
  rm,
  writeFile,
} from 'node:fs/promises';
import { join, basename } from 'node:path';
import { createGunzip, createGzip } from 'node:zlib';

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
      /^[A-Za-z0-9._-]+\.(tar\.gz|sql\.gz|pashiz|pashizbundle)$/.test(name) &&
      basename(name) === name
    );
  }

  /**
   * Keeps a copy of an organization or user export on the server.
   *
   * The browser gets the same bytes, but a backup that exists only in one
   * person's downloads folder is a backup nobody else can find. Written with
   * the same restrictive mode as the dumps beside it.
   *
   * The name is rebuilt here rather than trusted: it arrives from an
   * organization's own title, which a person chose and which can contain
   * anything at all.
   */
  public async save(
    preferredName: string,
    content: Buffer,
    marker?: string,
  ): Promise<string> {
    await mkdir(this.directory, { recursive: true });

    const extension = preferredName.endsWith('.pashizbundle')
      ? 'pashizbundle'
      : 'pashiz';
    // Organization names are usually Persian, and the listing only ever shows
    // names this service can match again, which is ASCII. A name that survives
    // that filter as nothing but separators says less than the date does, so
    // it gives way to a plain word.
    const stem = basename(preferredName)
      .replace(/\.(pashiz|pashizbundle)$/, '')
      .replace(/[^A-Za-z0-9._-]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^[-._]+|[-._]+$/g, '')
      .slice(0, 60);
    const readable = /[A-Za-z0-9]/.test(stem)
      ? stem
      : extension === 'pashizbundle'
        ? 'user'
        : 'organization';
    const stamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\..+$/, '');
    const name = `${readable}-${marker ? `${marker}-` : ''}${stamp}.${extension}`;

    await writeFile(join(this.directory, name), content, { mode: 0o600 });
    this.logger.log(`Export kept on the server: ${name}`);

    return name;
  }

  /**
   * Reads one archive back off the disk, for restoring. Same name guard as the
   * download route: only a plain filename this service could have written.
   */
  public async read(name: string): Promise<Buffer> {
    if (!this.isSafeName(name)) throw new Error('نام پرونده معتبر نیست.');

    return readFile(join(this.directory, name));
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

  /**
   * Puts a whole-installation dump back.
   *
   * Only a `.sql.gz` this service or `update.sh` wrote, and only one already
   * sitting in the backup directory — nothing is restored from an upload,
   * because a dump is arbitrary SQL and running it is indistinguishable from
   * handing the database over.
   *
   * The process exits when it is done. Every connection this server holds now
   * points at tables that were dropped and recreated underneath it, and the
   * caches above them describe rows that no longer exist; a restart is the
   * only honest way back. Compose is configured `restart: on-failure`, so the
   * non-zero exit is what brings it back clean, a few seconds later.
   */
  public async restore(name: string): Promise<void> {
    if (!this.isSafeName(name) || !name.endsWith('.sql.gz')) {
      throw new Error('این پرونده یک پشتیبان کامل پایگاه‌داده نیست.');
    }
    const source = join(this.directory, name);
    await stat(source);

    const host = this.configService.get('systemDatabase.host');
    const port = String(this.configService.get('systemDatabase.port') ?? 3306);
    const user = this.configService.get('systemDatabase.user');
    const password = this.configService.get('systemDatabase.password');

    this.logger.warn(`Restoring the installation from ${name}.`);
    await this.feedToMysql(source, host, port, user, password);
    this.logger.warn(`Restored from ${name}; restarting to pick it up.`);

    // Let the response reach the browser before the process goes away.
    setTimeout(() => process.exit(1), 1500);
  }

  private feedToMysql(
    source: string,
    host: string,
    port: string,
    user: string,
    password: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(
        'mysql',
        [`--host=${host}`, `--port=${port}`, `--user=${user}`],
        { env: { ...process.env, MYSQL_PWD: password } },
      );
      const input = createReadStream(source);
      const gunzipStream = createGunzip();

      let err = '';
      child.stderr.on('data', (chunk) => (err += chunk));
      child.on('error', reject);
      input.on('error', reject);
      gunzipStream.on('error', reject);
      child.on('close', (code) =>
        code === 0
          ? resolve()
          : reject(new Error(err.trim() || `mysql exited ${code}`)),
      );
      input.pipe(gunzipStream).pipe(child.stdin);
    });
  }

  /**
   * Takes a dump and waits for it. `start` returns the moment it has spawned
   * one, which suits a person clicking a button and not a scheduled run that
   * has to know whether it worked.
   */
  public async runNow(marker?: string): Promise<string> {
    if (this.state.status === 'running') {
      throw new Error('a backup is already running');
    }
    this.state = { status: 'running', startedAt: new Date().toISOString() };

    try {
      const name = await this.run(marker);
      return name;
    } catch (error) {
      this.state = {
        status: 'failed',
        finishedAt: new Date().toISOString(),
        message: this.explain(error),
      };
      throw error;
    }
  }

  /**
   * Removes the oldest automatic archives, keeping `keep` of each kind.
   * Anything without the marker was taken deliberately and is left alone.
   */
  public async pruneAutomatic(keep: number): Promise<number> {
    const files = await this.list();
    const groups = new Map<string, BackupFile[]>();

    for (const file of files) {
      if (!/-auto-\d{8}T\d{6}\./.test(file.name)) continue;

      const kind = file.name.slice(file.name.indexOf('.') + 1);
      groups.set(kind, [...(groups.get(kind) ?? []), file]);
    }
    let removed = 0;

    for (const group of groups.values()) {
      const doomed = group
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(keep);

      for (const file of doomed) {
        if (await this.remove(file.name)) removed += 1;
      }
    }
    return removed;
  }

  private async run(marker?: string): Promise<string> {
    await mkdir(this.directory, { recursive: true });

    const stamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\..+$/, '');
    const name = `pashiz-portal-${marker ? `${marker}-` : ''}${stamp}.sql.gz`;
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

    return name;
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
