import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import i18n, {
  initializeI18n,
  getBestLanguage,
  type SupportedLanguage,
} from '@/i18n';

export type ThemePreference = 'system' | 'light' | 'dark';
export type LanguagePreference = SupportedLanguage;

type SettingsState = {
  theme: ThemePreference;
  language: LanguagePreference;
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: LanguagePreference) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: getBestLanguage(),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => {
        if (i18n.language !== language) {
          void initializeI18n(language).catch((error) => {
            console.error('settingsStore: language change failed', error);
          });
        }
        set({ language });
      },
    }),
    {
      name: '@helper_ia_settings',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        const language = state?.language ?? getBestLanguage();
        void initializeI18n(language).catch((error) => {
          console.error('settingsStore: rehydrate failed', error);
        });
      },
    }
  )
);
