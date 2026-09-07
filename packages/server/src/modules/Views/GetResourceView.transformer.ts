import { Transformer } from '../Transformer/Transformer';
import { View } from './models/View.model';

export class GetResourceViewTransformer extends Transformer {
  public includeAttributes = (): string[] => {
    return ['name'];
  };

  /**
   * The view's name in the reader's language.
   *
   * Most predefined views carry a plain English name — "Draft", "Services" —
   * which was being handed to `i18n.t()` as though it were a key. A key that
   * does not exist resolves to itself, so the translation silently did nothing
   * and every list showed its views in English.
   *
   * The slug is the stable identifier here, so the lookup is keyed on that. A
   * few views already carry a real key in their name, and those keep working:
   * a name with a dot in it is taken as written.
   */
  name(view: View) {
    const declared = view.name;

    if (declared?.includes('.')) {
      return this.context.i18n.t(declared);
    }
    const slug = (view as View & { slug?: string }).slug;

    if (!slug) return declared;

    return this.context.i18n.t(`view.${slug}`, { defaultValue: declared });
  }
}
