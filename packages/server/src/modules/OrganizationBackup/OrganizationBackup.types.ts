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
const SCHEMA_TABLES = [
  'knexMigrations',
  'knexMigrationsLock',
  'bigcapitalSeeds',
  'bigcapitalSeedsLock',
];

/**
 * Tables that say who may use this installation, rather than what the
 * organization has bought and sold.
 *
 * `users` here is the tenant's own mirror of the system users, keyed by
 * `systemUserId` — an id that means something only on the installation that
 * issued it. Carrying it across deletes the local owner's row and puts a
 * stranger's in its place, and because that row is written once when the
 * organization is first built and never again, nothing recreates it. Every
 * authorized request then fails to resolve an ability, so the whole
 * application stops loading rather than merely showing the wrong name.
 *
 * `roles` and `rolePermissions` travel with it: the local user rows that stay
 * behind point at a role by id, and replacing the roles underneath them
 * dangles that reference into the same failure.
 */
const IDENTITY_TABLES = ['users', 'roles', 'rolePermissions'];

export const EXCLUDED_TABLES = [...SCHEMA_TABLES, ...IDENTITY_TABLES];

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
