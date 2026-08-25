// @ts-nocheck
import { find } from 'lodash';
import moment from 'moment';
import * as R from 'ramda';
import React from 'react';
import intl from 'react-intl-universal';
import rtlDetect from 'rtl-detect';
import { setLocale } from 'yup';
import { useWatchImmediate } from '../hooks';
import { AppIntlProvider } from './AppIntlProvider';
import { withDashboardActions } from '@/containers/Dashboard/withDashboardActions';
import { useSplashLoading } from '@/hooks/state';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  localeSettings,
} from '@/constants/languagesOptions';

/**
 * Locale used for any key a translation file has not covered yet, so a partial
 * translation degrades to English instead of showing raw message keys.
 */
const FALLBACK_LOCALE = 'en';

/**
 * Retrieve the current local.
 */
function getCurrentLocal() {
  // Only an explicit choice selects the language: the `?lang=` parameter, the
  // `locale` cookie (which the dashboard boot fills from the organization's
  // language setting), or a previous choice kept in local storage.
  //
  // `intl.determineLocale()` is deliberately not used here: its last resort is
  // the browser language, which would open this Iranian distribution in English
  // on any machine whose browser is set to English.
  const options = {
    urlLocaleKey: 'lang',
    cookieLocaleKey: 'locale',
    localStorageLocaleKey: 'lang',
  };
  const chosen =
    intl.getLocaleFromURL(options) ||
    intl.getLocaleFromCookie(options) ||
    intl.getLocaleFromLocalStorage(options);

  // A stored value may carry a region ("fa-IR"); match on the language subtag.
  const language = String(chosen || '').split(/[-_]/)[0];

  return find(SUPPORTED_LOCALES, { value: language })
    ? language
    : DEFAULT_LOCALE.value;
}

/**
 * Loads the localization data of the given locale.
 */
async function loadLocales(currentLocale) {
  return await import(`../lang/${currentLocale}/index.json`).then(
    (module) => module.default,
  );
}

/**
 * Loads the localization data of yup validation library.
 */
async function loadYupLocales(currentLocale) {
  return await import(`../lang/${currentLocale}/locale.tsx`).then(
    (module) => module.locale,
  );
}

/**
 * Dynamically loads the moment.js locale bundle for the given locale.
 */
/**
 * Loaders for moment's locale bundles, one entry per locale.
 *
 * These cannot be written as a single `import(`moment/locale/${locale}`)`: a
 * template literal over a bare package path is not statically analysable, so
 * the bundler cannot resolve it and the import fails at runtime.
 */
const MOMENT_LOCALE_LOADERS = {
  'ar-ly': () => import('moment/locale/ar-ly'),
  fa: () => import('moment/locale/fa'),
};

async function loadMomentLocale(currentLocale) {
  const momentLocale = transformMomentLocale(currentLocale);
  const loadLocaleBundle = MOMENT_LOCALE_LOADERS[momentLocale];

  // English is moment's built-in locale and needs no bundle.
  if (!loadLocaleBundle) return;

  await loadLocaleBundle();

  // moment's Persian locale rewrites every formatted number into Persian digit
  // glyphs, including the `YYYY-MM-DD` strings the app sends to the API — which
  // would corrupt request payloads. (It is the same hazard that makes Arabic
  // map onto `ar-ly` above, the one Arabic variant that leaves digits alone.)
  // Persian digits are applied at the presentation layer instead, so drop the
  // locale's postformat hook while keeping its Persian wording.
  if (momentLocale === 'fa') {
    moment.updateLocale('fa', { postformat: (value) => value });
  }
}

/**
 * Modifies the html document direction to RTl if it was rtl-language.
 */
function useDocumentDirectionModifier(locale, isRTL) {
  React.useEffect(() => {
    if (isRTL) {
      const htmlDocument = document.querySelector('html');
      htmlDocument.setAttribute('dir', 'rtl');
      htmlDocument.setAttribute('lang', locale);
    }
  }, [isRTL, locale]);
}

function transformMomentLocale(currentLocale) {
  return currentLocale === 'ar' ? 'ar-ly' : currentLocale;
}

/**
 * Loads application locales of the given current locale.
 * @param {string} currentLocale
 * @returns {{ isLoading: boolean }}
 */
function useAppLoadLocales(currentLocale) {
  const [startLoading, stopLoading] = useSplashLoading();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Loads the locales data file, alongside the fallback locale so partially
    // translated languages still render English for the keys they are missing.
    Promise.all([
      loadLocales(currentLocale),
      currentLocale === FALLBACK_LOCALE
        ? Promise.resolve(null)
        : loadLocales(FALLBACK_LOCALE),
    ])
      .then(([results, fallbackResults]) => {
        return intl.init({
          currentLocale,
          fallbackLocale: FALLBACK_LOCALE,
          locales: {
            [currentLocale]: results,
            ...(fallbackResults ? { [FALLBACK_LOCALE]: fallbackResults } : {}),
          },
        });
      })
      .then(() => loadMomentLocale(currentLocale))
      .then(() => {
        moment.locale(transformMomentLocale(currentLocale));
        setIsLoading(false);
      });
  }, [currentLocale, stopLoading]);

  // Watches the value to start/stop splash screen.
  useWatchImmediate(
    (value) => (value ? startLoading() : stopLoading()),
    isLoading,
  );
  return { isLoading };
}

/**
 * Loads application yup locales based on the given current locale.
 * @param {string} currentLocale
 * @returns {{ isLoading: boolean }}
 */
function useAppYupLoadLocales(currentLocale) {
  const [startLoading, stopLoading] = useSplashLoading();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadYupLocales(currentLocale)
      .then((results) => {
        setLocale(results);
        setIsLoading(false);
      })
      .then(() => {});
  }, [currentLocale, stopLoading]);

  // Watches the valiue to start/stop splash screen.
  useWatchImmediate(
    (value) => (value ? startLoading() : stopLoading()),
    isLoading,
  );
  return { isLoading };
}

/**
 * Application Intl loader.
 */
function AppIntlLoader({ children }) {
  // Retrieve the current locale.
  const currentLocale = getCurrentLocal();

  // Detarmines the document direction based on the given locale.
  const isRTL = rtlDetect.isRtlLang(currentLocale);

  // Calendar and digit system that belong to the given locale.
  const { calendar, persianDigits } = localeSettings(currentLocale);

  // Modifies the html document direction
  useDocumentDirectionModifier(currentLocale, isRTL);

  // Loads yup localization of the given locale.
  const { isLoading: isAppYupLocalesLoading } =
    useAppYupLoadLocales(currentLocale);

  // Loads application locales of the given locale.
  const { isLoading: isAppLocalesLoading } = useAppLoadLocales(currentLocale);

  // Detarmines whether the app locales loading.
  const isLoading = isAppYupLocalesLoading || isAppLocalesLoading;

  return (
    <AppIntlProvider
      currentLocale={currentLocale}
      isRTL={isRTL}
      calendar={calendar}
      persianDigits={persianDigits}
    >
      {isLoading ? null : children}
    </AppIntlProvider>
  );
}

export default R.compose(withDashboardActions)(AppIntlLoader);
