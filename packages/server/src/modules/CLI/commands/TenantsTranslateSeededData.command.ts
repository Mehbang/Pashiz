import { Command, Option } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { CURRENCIES } from '@bigcapital/utils';
import { BaseCommand } from './BaseCommand';

interface TranslateSeededDataOptions {
  organization?: string;
  apply?: boolean;
}

/**
 * Tables whose seeded rows are named from a translation namespace.
 *
 * Identifiers are camelCase: the knex instance carries objection's snake-case
 * mappers, which turn `taxRates` into `TAX_RATES` on the way to the database.
 * Writing `TAX_RATES` here would come out as `TAX__RATES`.
 */
const TRANSLATED_TABLES = [
  { table: 'accounts', column: 'name', namespace: 'account_name' },
  {
    table: 'accounts',
    column: 'description',
    namespace: 'account_description',
  },
  { table: 'taxRates', column: 'name', namespace: 'tax_rate_name' },
  {
    table: 'taxRates',
    column: 'description',
    namespace: 'tax_rate_description',
  },
];

/**
 * Renames the data an organization was seeded with into its own language.
 *
 * The seeders translate as they insert, so organizations created from now on
 * need nothing. This exists for the ones built before a given seeder learned
 * to translate — their chart of accounts, tax rates, warehouse and currency
 * list are still in English.
 *
 * Only rows that still carry the exact English seed text are touched, so a
 * name the user has edited is left alone. Run without `--apply` to see what
 * would change.
 */
@Injectable()
@Command({
  name: 'tenants:translate-seeded-data',
  description:
    "Renames an organization's seeded data into its configured language.",
})
export class TenantsTranslateSeededDataCommand extends BaseCommand {
  constructor(configService: ConfigService) {
    super(configService);
  }

  @Option({
    flags: '-o, --organization <organization>',
    description:
      'Organization id to translate; defaults to every organization.',
  })
  parseOrganization(val: string): string {
    return val;
  }

  @Option({
    flags: '--apply',
    description: 'Write the changes; without it the command only reports them.',
  })
  parseApply(): boolean {
    return true;
  }

  /**
   * English text -> translated text, for one namespace in one language.
   */
  private translationMap(namespace: string, lang: string) {
    const dir = path.join(__dirname, '../../../i18n');
    const read = (language: string) => {
      const file = path.join(dir, language, `${namespace}.json`);
      return fs.existsSync(file)
        ? JSON.parse(fs.readFileSync(file, 'utf8'))
        : {};
    };
    const english = read('en');
    const translated = read(lang);

    return new Map<string, string>(
      Object.entries(english)
        .filter(([key]) => key in translated)
        .map(([key, text]) => [text as string, translated[key] as string]),
    );
  }

  /**
   * The currency's name in the given language, matching what the seeder now
   * inserts for a newly created organization.
   */
  private currencyName(code: string, lang: string): string | null {
    const meta = CURRENCIES[code];
    if (!meta) return null;

    try {
      const named = new Intl.DisplayNames([lang], { type: 'currency' }).of(
        code,
      );
      if (named && named !== code) return named;
    } catch {
      // The runtime has no data for this language.
    }
    return meta.symbol_native || null;
  }

  private async translateTenant(
    knex: any,
    lang: string,
    apply: boolean,
  ): Promise<number> {
    let changed = 0;

    const rename = async (
      table: string,
      column: string,
      from: string,
      to: string,
    ) => {
      const rows = await knex(table).where(column, from);
      if (!rows.length) return;

      changed += rows.length;
      this.log(`  ${table}.${column}: ${from}  ->  ${to}`);

      if (apply) await knex(table).where(column, from).update(column, to);
    };

    for (const { table, column, namespace } of TRANSLATED_TABLES) {
      for (const [english, translated] of this.translationMap(
        namespace,
        lang,
      )) {
        await rename(table, column, english, translated);
      }
    }

    // The warehouse and the head branch are named from their own namespaces,
    // keyed by a name rather than derived from the English text.
    const warehouses = this.translationMap('warehouses', lang);
    for (const [english, translated] of warehouses) {
      await rename('warehouses', 'name', english, translated);
    }
    const branches = this.translationMap('branches', lang);
    for (const [english, translated] of branches) {
      await rename('branches', 'name', english, translated);
    }

    // Currency names come from the runtime rather than a namespace.
    const currencies = await knex('currencies');
    for (const currency of currencies) {
      const meta = CURRENCIES[currency.currencyCode];
      const translated = this.currencyName(currency.currencyCode, lang);

      if (!meta || !translated || currency.currencyName !== meta.name) {
        continue;
      }
      changed++;
      this.log(
        `  currencies.currencyName: ${currency.currencyName}  ->  ${translated}`,
      );
      if (apply) {
        await knex('currencies')
          .where('currencyCode', currency.currencyCode)
          .update('currencyName', translated);
      }
    }
    return changed;
  }

  async run(
    passedParams: string[],
    options: TranslateSeededDataOptions,
  ): Promise<void> {
    try {
      const sysKnex = this.initSystemKnex();
      const tenants = await this.getAllInitializedTenants(sysKnex);
      const apply = Boolean(options.apply);
      let total = 0;

      for (const tenant of tenants) {
        if (
          options.organization &&
          tenant.organizationId !== options.organization
        ) {
          continue;
        }
        const metadata = await sysKnex('tenantsMetadata')
          .where('tenantId', tenant.id)
          .first();
        const lang = metadata?.language;

        if (!lang || lang === 'en') continue;

        this.log(`\n${metadata.name || tenant.organizationId} (${lang})`);

        const knex = this.initTenantKnex(tenant.organizationId);
        try {
          total += await this.translateTenant(knex, lang, apply);
        } finally {
          await knex.destroy();
        }
      }
      await sysKnex.destroy();

      this.success(
        `\n${total} value(s) ${apply ? 'renamed' : 'would be renamed'}.` +
          (apply ? '' : ' Re-run with --apply to write them.'),
      );
    } catch (error) {
      this.exit(error);
    }
  }
}
