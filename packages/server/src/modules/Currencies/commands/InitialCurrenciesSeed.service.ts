import { Inject, Injectable } from '@nestjs/common';
import { TenancyContext } from '@/modules/Tenancy/TenancyContext.service';
import { uniq } from 'lodash';
import { CURRENCIES as Currencies } from '@bigcapital/utils';
import { InitialCurrencies } from '../Currencies.constants';
import { TenantModelProxy } from '../../System/models/TenantBaseModel';
import { Currency } from '../models/Currency.model';

@Injectable()
export class InitialCurrenciesSeedService {
  constructor(
    @Inject(Currency.name)
    private readonly currencyModel: TenantModelProxy<typeof Currency>,

    private readonly tenancyContext: TenancyContext,
  ) {}

  /**
   * The currency's name in the organization's language.
   *
   * The shared currency table carries English names only. `Intl.DisplayNames`
   * already knows every ISO currency in every locale, so no translation table
   * is needed; the toman, which has no ISO code, falls back to its own native
   * name, and anything else the runtime cannot name keeps the English one.
   */
  private currencyName(currencyMeta, lang?: string): string {
    if (!lang || lang === 'en') return currencyMeta.name;

    try {
      const displayNames = new Intl.DisplayNames([lang], { type: 'currency' });
      const named = displayNames.of(currencyMeta.code);

      if (named && named !== currencyMeta.code) return named;
    } catch {
      // The runtime has no data for this language; fall through.
    }
    return currencyMeta.symbol_native || currencyMeta.name;
  }

  /**
   * Seeds the given base currency to the currencies list.
   * @param {string} baseCurrency - Base currency code.
   */
  public async seedCurrencyByCode(currencyCode: string): Promise<void> {
    const currencyMeta = Currencies[currencyCode];

    // A code the table does not know (a currency outside ISO 4217 that has not
    // been declared) would otherwise insert a row of undefined values.
    if (!currencyMeta) return;

    const foundBaseCurrency = await this.currencyModel()
      .query()
      .findOne('currency_code', currencyCode);
    if (!foundBaseCurrency) {
      const tenant = await this.tenancyContext.getTenant(true);

      await this.currencyModel()
        .query()
        .insert({
          currencyCode: currencyMeta.code,
          currencyName: this.currencyName(
            currencyMeta,
            tenant.metadata?.language,
          ),
          currencySign: currencyMeta.symbol,
        });
    }
  }

  /**
   * Seeds initial currencies to the organization.
   * @param {string} baseCurrency - Base currency code.
   */
  public async seedInitialCurrencies(baseCurrency: string): Promise<void> {
    const initialCurrencies = uniq([...InitialCurrencies, baseCurrency]);

    // Seed currency opers.
    const seedCurrencyOpers = initialCurrencies.map((currencyCode) => {
      return this.seedCurrencyByCode(currencyCode);
    });
    await Promise.all(seedCurrencyOpers);
  }
}
