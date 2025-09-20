import frCommon from './locales/fr/common.json';
import frGenerated from './locales/fr/generated.json';
import frHistory from './locales/fr/history.json';
import frLegal from './locales/fr/legal.json';
import frPrompt from './locales/fr/prompt.json';
import frSettings from './locales/fr/settings.json';
import enCommon from './locales/en/common.json';
import enGenerated from './locales/en/generated.json';
import enHistory from './locales/en/history.json';
import enLegal from './locales/en/legal.json';
import enPrompt from './locales/en/prompt.json';
import enSettings from './locales/en/settings.json';

export const resources = {
  fr: {
    common: frCommon,
    prompt: frPrompt,
    history: frHistory,
    settings: frSettings,
    generated: frGenerated,
    legal: frLegal,
  },
  en: {
    common: enCommon,
    prompt: enPrompt,
    history: enHistory,
    settings: enSettings,
    generated: enGenerated,
    legal: enLegal,
  },
} as const;

export const defaultNamespaces = ['common'] as const;

export type SupportedLanguage = keyof typeof resources;
export type AppNamespace = keyof (typeof resources)[SupportedLanguage];
export const allNamespaces = Object.keys(resources.fr) as AppNamespace[];
export const supportedLanguages = Object.keys(resources) as SupportedLanguage[];

export const getNamespaceLoader = (
  language: SupportedLanguage,
  namespace: AppNamespace
) => {
  const bundle = resources[language]?.[namespace];
  if (!bundle) {
    return null;
  }
  return async () => bundle;
};
