import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import i18n, {
  localeTag,
  resolveLocale,
  type AppLocale,
  type LocalePreference,
} from './index';

const KEY = 'amg:locale';

interface LocaleContextValue {
  preference: LocalePreference;
  locale: AppLocale;
  localeTag: string;
  setPreference: (pref: LocalePreference) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<LocalePreference>('auto');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === 'auto' || v === 'en' || v === 'pt') setPreferenceState(v);
      })
      .finally(() => setReady(true));
  }, []);

  const locale = resolveLocale(preference);

  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale]);

  const setPreference = useCallback((pref: LocalePreference) => {
    setPreferenceState(pref);
    void AsyncStorage.setItem(KEY, pref);
  }, []);

  const value = useMemo(
    () => ({
      preference,
      locale,
      localeTag: localeTag(locale),
      setPreference,
    }),
    [preference, locale, setPreference],
  );

  if (!ready) return null;

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useAppLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useAppLocale precisa estar dentro de <LocaleProvider>');
  return ctx;
}
