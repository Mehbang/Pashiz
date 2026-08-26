import { BaseModel } from '@/models/Model';

/**
 * A setting belonging to the installation rather than to an organization.
 *
 * Read through `InstanceSettingsService`, never directly: a setting that has
 * never been written here falls back to the environment variable it used to
 * live in, and callers should not have to know which of the two answered.
 */
export class InstanceSetting extends BaseModel {
  public key!: string;
  public value!: string | null;

  static tableName = 'instance_settings';

  static get timestamps() {
    return ['createdAt', 'updatedAt'];
  }
}
