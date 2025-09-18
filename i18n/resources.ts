import fr from './locales/fr/common.json';
import en from './locales/en/common.json';

export const resources = {
  fr: { translation: fr },
  en: { translation: en },
} as const;

export type AppI18nResources = typeof resources;
export type SupportedLanguage = keyof AppI18nResources;
