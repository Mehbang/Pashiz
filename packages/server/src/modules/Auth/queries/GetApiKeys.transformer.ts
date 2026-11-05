import { Transformer } from '@/modules/Transformer/Transformer';

export class GetApiKeysTransformer extends Transformer {
  public includeAttributes = (): string[] => {
    return ['token'];
  };

  public excludeAttributes = (): string[] => {
    // 'key' is the full secret; the base transformer spreads every column, so
    // without excluding it the list endpoint returned the plaintext key. Only
    // the truncated 'token' virtual below is exposed.
    return ['tenantId', 'key'];
  };

  public token(apiKey) {
    return apiKey.key ? `${apiKey.key.substring(0, 8)}...` : '';
  }
}
