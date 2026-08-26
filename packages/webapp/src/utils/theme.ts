/**
 * The light/dark choice.
 *
 * Both themes are defined in `style/_variables.scss`: the light one on `:root`
 * and the dark one under `.bp4-dark`, which every component's own dark rules
 * hang off as well. All this has to do is decide which of the two is in force
 * and remember the answer.
 *
 * The class is written before the first paint by a small script inlined in
 * `index.html`; that script and these helpers have to agree on the key and the
 * class name, so both are stated here.
 */
export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

const DARK_CLASS = 'bp4-dark';

/**
 * What the operating system asks for. Used until the reader says otherwise,
 * so a first visit already matches the rest of their machine.
 */
export const systemTheme = (): Theme =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

/**
 * The reader's own choice, if they have made one.
 *
 * Reading `localStorage` throws outright in some privacy modes rather than
 * returning nothing, so it is guarded: a theme that cannot be remembered is a
 * far smaller problem than an application that will not start.
 */
export const storedTheme = (): Theme | null => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  } catch {
    return null;
  }
};

/**
 * The theme actually on the page.
 *
 * Read from the document rather than from storage: the head script has already
 * resolved the choice, and this way a toggle always flips what the reader can
 * see, even if storage was unavailable to record it.
 */
export const appliedTheme = (): Theme =>
  document.documentElement.classList.contains(DARK_CLASS) ||
  document.body?.classList.contains(DARK_CLASS)
    ? 'dark'
    : 'light';

/**
 * `<html>` and `<body>` both carry the class. The head script can only reach
 * the first — `<body>` does not exist yet when it runs — while a few
 * stylesheet rules, and `useIsDarkMode`, name the second.
 */
export const applyTheme = (theme: Theme): void => {
  const isDark = theme === 'dark';

  document.documentElement.classList.toggle(DARK_CLASS, isDark);
  document.body?.classList.toggle(DARK_CLASS, isDark);
};

/**
 * Puts on `<body>` whatever the head script decided. Called once at startup,
 * by which point `<body>` exists.
 */
export const syncTheme = (): void => applyTheme(appliedTheme());

export const setTheme = (theme: Theme): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The choice simply will not outlive the tab.
  }
  applyTheme(theme);
};

/**
 * Follows the operating system while the reader has expressed no preference of
 * their own, so a machine that switches at dusk takes the application with it.
 * The moment they pick a theme here, that choice wins and this stops mattering.
 */
export const watchSystemTheme = (): void => {
  const query = window.matchMedia?.('(prefers-color-scheme: dark)');
  if (!query) return;

  query.addEventListener('change', (event) => {
    if (storedTheme()) return;
    applyTheme(event.matches ? 'dark' : 'light');
  });
};

export const toggleTheme = (): Theme => {
  const next: Theme = appliedTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);

  return next;
};
