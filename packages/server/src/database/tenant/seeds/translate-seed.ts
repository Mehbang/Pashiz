import { I18nService } from 'nestjs-i18n';

/**
 * Translation key for a seeded string, derived from its English text.
 *
 * Seed data carries English names and descriptions; the matching
 * `i18n/<lang>/<namespace>.json` files hold the translations for the languages
 * that have them. Deriving the key from the text keeps the seed data itself
 * free of translation plumbing.
 */
export const seedTranslationKey = (namespace: string, text: string): string =>
  `${namespace}.${text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 70)}`;

/**
 * Translates a seeded string into the organization's language, falling back to
 * the original English when that language has no translation for it.
 */
export const translateSeed = (
  i18n: I18nService,
  namespace: string,
  text: string,
  lang: string,
): string => {
  const key = seedTranslationKey(namespace, text);
  const translated = i18n.t(key, { lang }) as string;

  return translated === key ? text : translated;
};
