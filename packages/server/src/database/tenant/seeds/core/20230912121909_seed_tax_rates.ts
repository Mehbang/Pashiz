import { TenantSeeder } from '@/libs/migration-seed/TenantSeeder';
import { InitialTaxRates } from '../data/TaxRates';
import { translateSeed } from '../translate-seed';

export default class SeedTaxRates extends TenantSeeder {
  /**
   * Seeds initial tax rates to the organization.
   */
  up(knex) {
    const lang = this.tenant?.metadata?.language || 'en';

    const data = InitialTaxRates.map((taxRate) => ({
      ...taxRate,
      name: translateSeed(this.i18n, 'tax_rate_name', taxRate.name, lang),
      description: translateSeed(
        this.i18n,
        'tax_rate_description',
        taxRate.description,
        lang,
      ),
    }));
    return knex('tax_rates').then(async () => {
      // Inserts seed entries.
      return knex('tax_rates').insert(data);
    });
  }
}
