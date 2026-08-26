// import { IAccountType } from './Accounts.types';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AccountTypesUtils } from '@/libs/accounts-utils/AccountTypesUtils';

@Injectable()
export class GetAccountTypesService {
  constructor(private readonly i18n: I18nService) {}

  /**
   * Retrieve all accounts types.
   * @param {number} tenantId -
   * @return {IAccountType}
   */
  public getAccountsTypes() {
    const accountTypes = AccountTypesUtils.getList();

    // `label` is an i18n key, the same one the account rows and the filter
    // options resolve. This list is served raw, so it has to resolve its own.
    return accountTypes.map((accountType) => ({
      ...accountType,
      label: this.i18n.t(accountType.label, {
        defaultValue: accountType.label,
      }),
    }));
  }
}
