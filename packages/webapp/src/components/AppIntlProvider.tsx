import React, { createContext } from 'react';
import type { CalendarSystem } from '@/utils/date-formatter';

interface AppIntlContextValue {
  currentLocale: string;
  direction: 'rtl' | 'ltr';
  isRTL: boolean;
  isLTR: boolean;
  /** Calendar the UI renders and parses dates in. */
  calendar: CalendarSystem;
  /** Whether numbers are rendered with Persian digit glyphs. */
  persianDigits: boolean;
}

const AppIntlContext = createContext<AppIntlContextValue>(
  {} as AppIntlContextValue,
);

interface AppIntlProviderProps {
  currentLocale: string;
  isRTL: boolean;
  calendar: CalendarSystem;
  persianDigits: boolean;
  children: React.ReactNode;
}

/**
 * Application intl provider.
 */
function AppIntlProvider({
  currentLocale,
  isRTL,
  calendar,
  persianDigits,
  children,
}: AppIntlProviderProps) {
  const provider = React.useMemo<AppIntlContextValue>(
    () => ({
      currentLocale,
      isRTL,
      isLTR: !isRTL,
      direction: isRTL ? 'rtl' : 'ltr',
      calendar,
      persianDigits,
    }),
    [currentLocale, isRTL, calendar, persianDigits],
  );

  return (
    <AppIntlContext.Provider value={provider}>
      {children}
    </AppIntlContext.Provider>
  );
}

const useAppIntlContext = () =>
  React.useContext<AppIntlContextValue>(AppIntlContext);

export { AppIntlProvider, useAppIntlContext };
export type { AppIntlContextValue };
