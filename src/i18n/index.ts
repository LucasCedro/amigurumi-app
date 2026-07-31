import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import pt from './locales/pt.json';

export type LocalePreference = 'auto' | 'en' | 'pt';
export type AppLocale = 'en' | 'pt';

export function resolveLocale(preference: LocalePreference): AppLocale {
  if (preference === 'en' || preference === 'pt') return preference;
  const code = Localization.getLocales()[0]?.languageCode ?? 'en';
  return code.startsWith('pt') ? 'pt' : 'en';
}

export function localeTag(locale: AppLocale): string {
  return locale === 'pt' ? 'pt-BR' : 'en-US';
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pt: { translation: pt },
  },
  lng: resolveLocale('auto'),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export default i18n;
