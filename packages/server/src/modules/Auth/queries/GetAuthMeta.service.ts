import { Injectable } from '@nestjs/common';
import { IAuthGetMetaPOJO } from '../Auth.interfaces';
import { InstanceSettingsService } from '@/modules/Admin/InstanceSettings.service';

@Injectable()
export class GetAuthMetaService {
  constructor(private readonly instanceSettings: InstanceSettingsService) {}

  /**
   * Retrieves the authentication meta for SPA.
   *
   * Read from the live settings rather than the environment: closing
   * registration from the administration portal has to hide the sign-up link
   * without a restart.
   * @returns {Promise<IAuthGetMetaPOJO>}
   */
  public async getAuthMeta(): Promise<IAuthGetMetaPOJO> {
    const signup = await this.instanceSettings.getSignupSettings();

    return {
      signupDisabled: signup.disabled,
    };
  }
}
