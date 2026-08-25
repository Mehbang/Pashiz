import { TenantSeeder } from '@/libs/migration-seed/TenantSeeder';
import { AccountsData } from '../data/accounts';
import { translateSeed } from '../translate-seed';

export default class SeedAccounts extends TenantSeeder {
  /**
   * Seeds initial accounts to the organization.
   */
  up(knex) {
    const lang = this.tenant.metadata?.language || 'en';

    const data = AccountsData.map((account) => ({
      ...account,
      name: translateSeed(this.i18n, 'account_name', account.name, lang),
      description: account.description
        ? translateSeed(
            this.i18n,
            'account_description',
            account.description,
            lang,
          )
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
