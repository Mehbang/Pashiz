import { TenantSeeder } from '@/libs/migration-seed/TenantSeeder';
import { AccountsData } from '../data/accounts';

/**
 * Translation key for a seeded account string, derived from its English text.
 * The seed data carries English names and descriptions, and the matching
 * `i18n/<lang>/account_name.json` and `account_description.json` files hold the
 * translations for the languages that have them.
 */
const translationKey = (namespace: string, text: string): string =>
  `${namespace}.${text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 70)}`;

export default class SeedAccounts extends TenantSeeder {
  /**
   * Translates a seeded string into the organization's language, falling back
   * to the original English when that language has no translation for it.
   */
  private translate(namespace: string, text: string, lang: string): string {
    const key = translationKey(namespace, text);
    const translated = this.i18n.t(key, { lang }) as string;

    return translated === key ? text : translated;
  }

  /**
   * Seeds initial accounts to the organization.
   */
  up(knex) {
    const lang = this.tenant.metadata?.language || 'en';

    const data = AccountsData.map((account) => ({
      ...account,
      name: this.translate('account_name', account.name, lang),
      description: account.description
        ? this.translate('account_description', account.description, lang)
        : '',
      currencyCode: this.tenant.metadata.baseCurrency,
      seededAt: new Date(),
    }));
    return knex('accounts').then(async () => {
      // Inserts seed entries.
      return knex('accounts').insert(data);
    });
  }
}
