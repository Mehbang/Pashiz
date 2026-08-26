/**
 * One organization's data, in a form another Pashiz installation can take in.
 *
 * This is deliberately not a database dump. A dump carries the schema, the
 * server's collation and its MySQL version with it, and can only be restored
 * into a database of the same name — none of which survives a move between
 * installations, where the target's organization has a different id and so a
 * differently named database. Rows as JSON travel; a dump does not.
 */
export interface OrganizationBackup {
  /** Bumped whenever the shape below changes incompatibly. */
  format: number;
  app: 'pashiz';
  exportedAt: string;

  /** The version the export was taken from, for diagnosing a failed import. */
  sourceVersion?: string;

  /**
   * The organization's own settings — its name, currency, calendar language.
   * Held in the system database rather than the tenant one, so carried apart.
   */
  organization: OrganizationBackupMeta;

  /** Every tenant table, by name, as plain rows. */
  tables: Record<string, Array<Record<string, unknown>>>;

  /** Files the rows refer to, which live in the object store, not in SQL. */
  attachments: OrganizationBackupAttachment[];
}

export interface OrganizationBackupMeta {
  name?: string;
  baseCurrency?: string;
  language?: string;
  timezone?: string;
  dateFormat?: string;
  fiscalYear?: string;
  industry?: string;
  taxNumber?: string;
  location?: string;
  address?: Record<string, unknown>;
}

export interface OrganizationBackupAttachment {
  key: string;
  mimeType?: string;
  /** base64 — see the size cap in the export service. */
  data: string;
}

export interface OrganizationBackupSummary {
  organizationName?: string;
  exportedAt?: string;
  sourceVersion?: string;
  tableCount: number;
  rowCount: number;
  attachmentCount: number;
}

/** The current format. */
export const ORGANIZATION_BACKUP_FORMAT = 1;

/**
 * Tables that describe the schema rather than the organization's data. A
 * restore must not carry the source's migration history: the target runs its
 * own migrations, and importing someone else's bookkeeping would convince it
 * that migrations it has never run are already applied.
 */
export const EXCLUDED_TABLES = [
  'knexMigrations',
  'knexMigrationsLock',
  'bigcapitalSeeds',
  'bigcapitalSeedsLock',
];

/**
 * `ACCOUNTS_TRANSACTIONS` -> `accountsTransactions`.
 *
 * The tenant connection carries objection's snake-case mappers, which turn a
 * camelCase identifier into the UPPER_SNAKE the schema uses. Handing them a
 * name that is already UPPER_SNAKE produces `ACCOUNTS__TRANSACTIONS`, so
 * everything here — table names in the file, column keys in the rows — is
 * camelCase, and the mapper converts in both directions.
 */
export const toCamelTableName = (name: string): string =>
  name.toLowerCase().replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

export const ERRORS = {
  INVALID_BACKUP_FILE: 'INVALID_BACKUP_FILE',
  UNSUPPORTED_BACKUP_FORMAT: 'UNSUPPORTED_BACKUP_FORMAT',
  ATTACHMENTS_TOO_LARGE: 'ATTACHMENTS_TOO_LARGE',
};
