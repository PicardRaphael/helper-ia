import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  allNamespaces,
  defaultNamespaces,
  resources,
  supportedLanguages,
  type AppNamespace,
  type SupportedLanguage,
} from './resources';

export { supportedLanguages, defaultNamespaces } from './resources';
export type { SupportedLanguage, AppNamespace } from './resources';

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

const loadedNamespaces = new Map<SupportedLanguage, Set<AppNamespace>>();

const markNamespaceLoaded = (
  language: SupportedLanguage,
  namespace: AppNamespace
) => {
  const namespaces = loadedNamespaces.get(language) ?? new Set<AppNamespace>();
  namespaces.add(namespace);
  loadedNamespaces.set(language, namespaces);
};

const isNamespaceLoaded = (
  language: SupportedLanguage,
  namespace: AppNamespace
) => loadedNamespaces.get(language)?.has(namespace) ?? false;

const resolveLanguage = (
  requested?: SupportedLanguage
): SupportedLanguage => {
  if (requested && supportedLanguages.includes(requested)) {
    return requested;
  }
  return getBestLanguage();
};

const loadNamespace = async (
  language: SupportedLanguage,
  namespace: AppNamespace
) => {
  const bundle = resources[language]?.[namespace];
  if (bundle) {
    i18n.addResourceBundle(language, namespace, bundle, true, true);
    markNamespaceLoaded(language, namespace);
    return;
  }

  if (language !== fallbackLng) {
    await loadNamespace(fallbackLng, namespace);
  }
};

export const ensureNamespacesLoaded = async (
  namespaces: AppNamespace[],
  languageOverride?: SupportedLanguage
) => {
  const language = resolveLanguage(languageOverride ?? (i18n.language as SupportedLanguage));
  const namespacesToLoad = namespaces.filter(
    (namespace) => !isNamespaceLoaded(language, namespace)
  );

  await Promise.all(namespacesToLoad.map((namespace) => loadNamespace(language, namespace)));
};

export const initializeI18n = async (preferredLanguage?: SupportedLanguage) => {
  const lng = resolveLanguage(preferredLanguage);

  if (!i18n.isInitialized) {
    i18n.use(initReactI18next);
    await i18n.init({
      compatibilityJSON: 'v4',
      lng,
      fallbackLng,
      interpolation: { escapeValue: false },
      defaultNS: defaultNamespaces[0],
      returnNull: false,
      react: { useSuspense: false },
      initImmediate: false,
    });
  } else if (i18n.language !== lng) {
    await i18n.changeLanguage(lng);
  }

  await ensureNamespacesLoaded(allNamespaces, lng);

  return i18n;
};

void initializeI18n().catch((error) => {
  console.error('Failed to initialize i18n', error);
});

export default i18n;
