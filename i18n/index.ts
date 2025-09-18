import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { resources, type SupportedLanguage } from './resources';

export type { SupportedLanguage } from './resources';

const fallbackLng: SupportedLanguage = 'fr';

export const getBestLanguage = (): SupportedLanguage => {
  const locales = (Localization.getLocales && Localization.getLocales()) || [];
  const languageTag = locales.length > 0 ? locales[0].languageTag : fallbackLng;
  const primary = languageTag.split('-')[0]?.toLowerCase();
  if (primary && (primary === 'en' || primary === 'fr')) {
    return primary as SupportedLanguage;
  }
  return fallbackLng;
};

export const supportedLanguages = Object.keys(resources) as SupportedLanguage[];

export const initializeI18n = (preferredLanguage?: SupportedLanguage) => {
  const lng = preferredLanguage ?? getBestLanguage();

  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      compatibilityJSON: 'v4',
      resources,
      lng,
      fallbackLng,
      interpolation: { escapeValue: false },
      defaultNS: 'translation',
      returnNull: false,
    });
  } else if (preferredLanguage && i18n.language !== preferredLanguage) {
    i18n.changeLanguage(preferredLanguage);
  }

  return i18n;
};

initializeI18n();

export default i18n;
