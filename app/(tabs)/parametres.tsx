import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Alert,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenHeader } from '@/components/screen-header';
import {
  LanguagePreference,
  ThemePreference,
  useSettingsStore,
} from '@/stores/settingsStore';
import { supportedLanguages } from '@/i18n';
import { useEnsureNamespaces } from '@/hooks/useEnsureNamespaces';

export default function ParametresScreen() {
  const router = useRouter();
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  useEnsureNamespaces('common', 'settings');
  const { t } = useTranslation(['common', 'settings']);

  const themeOptions: { label: string; value: ThemePreference }[] = useMemo(
    () => [
      { label: t('common.theme.system'), value: 'system' },
      { label: t('common.theme.light'), value: 'light' },
      { label: t('common.theme.dark'), value: 'dark' },
    ],
    [t]
  );

  const languageOptions: { label: string; value: LanguagePreference }[] = useMemo(
    () =>
      supportedLanguages.map((code) => ({
        label: t(`common.language.${code}` as const),
        value: code as LanguagePreference,
      })),
    [t]
  );

  const handleRateApp = async () => {
    const storeUrl =
      Platform.OS === 'ios'
        ? t('links.appStore')
        : t('links.playStore');

    try {
      await Linking.openURL(storeUrl);
    } catch (error) {
      console.error('Erreur ouverture page notation:', error);
      Alert.alert(t('common.status.error'), t('settings:alerts.openStoreError'));
    }
  };

  const handleContact = async () => {
    try {
      await Linking.openURL(t('links.contactEmail'));
    } catch (error) {
      console.error('Erreur ouverture mail:', error);
      Alert.alert(t('common.status.error'), t('settings:alerts.openMailError'));
    }
  };

  const handleLegal = () => {
    router.push('/legal');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color='#808080'
          name='gearshape.fill'
          style={styles.headerImage}
        />
      }
    >
      <ScreenHeader
        title={t('settings:title')}
        subtitle={t('settings:subtitle')}
      />

      <ThemedView style={styles.section}>
        <ThemedText type='subtitle'>{t('settings:languageLabel')}</ThemedText>
        <View style={styles.pillGroup}>
          {languageOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.pill,
                language === option.value && styles.pillActive,
              ]}
              onPress={() => setLanguage(option.value)}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  language === option.value && styles.pillTextActive,
                ]}
              >
                {option.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        <ThemedText style={styles.helperText}>
          {t('settings:languageHelper')}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type='subtitle'>{t('settings:themeLabel')}</ThemedText>
        <View style={styles.pillGroup}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.pill, theme === option.value && styles.pillActive]}
              onPress={() => setTheme(option.value)}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  theme === option.value && styles.pillTextActive,
                ]}
              >
                {option.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        <ThemedText style={styles.helperText}>
          {t('settings:themeHelper')}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type='subtitle'>{t('settings:reviewLabel')}</ThemedText>
        <TouchableOpacity style={styles.row} onPress={handleRateApp}>
          <IconSymbol name='star.fill' size={20} color='#facc15' />
          <ThemedText style={styles.rowText}>
            {t('settings:reviewDescription')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type='subtitle'>{t('settings:contactLabel')}</ThemedText>
        <TouchableOpacity style={styles.row} onPress={handleContact}>
          <IconSymbol name='envelope' size={20} color='#6366f1' />
          <ThemedText style={styles.rowText}>
            {t('settings:contactDescription')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type='subtitle'>{t('settings:legalLabel')}</ThemedText>
        <TouchableOpacity style={styles.row} onPress={handleLegal}>
          <IconSymbol name='doc.text' size={20} color='#6366f1' />
          <ThemedText style={styles.rowText}>
            {t('settings:legalDescription')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  section: {
    gap: 12,
    marginTop: 16,
  },
  pillGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderColor: '#6366f1',
  },
  pillActive: {
    backgroundColor: '#6366f1',
  },
  pillText: {
    fontSize: 14,
  },
  pillTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowText: {
    fontSize: 14,
  },
});
