import Markdown from '@ronradtke/react-native-markdown-display';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { ScreenHeader } from '@/components/screen-header';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEnsureNamespaces } from '@/hooks/useEnsureNamespaces';

export default function LegalScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  useEnsureNamespaces('legal');
  const { t } = useTranslation('legal');

  const markdownStyles = useMemo(
    () => ({
      body: {
        color: colors.text,
        fontSize: 16,
        lineHeight: 24,
      },
      heading1: {
        color: colors.text,
        fontSize: 24,
        marginBottom: 12,
        fontWeight: '600',
      },
      heading2: {
        color: colors.text,
        fontSize: 20,
        marginTop: 12,
        marginBottom: 8,
        fontWeight: '600',
      },
      heading3: {
        color: colors.text,
        fontSize: 18,
        marginTop: 12,
        marginBottom: 8,
        fontWeight: '600',
      },
      paragraph: {
        marginBottom: 12,
      },
      strong: {
        fontWeight: '700',
        color: colors.text,
      },
      bullet_list: {
        marginBottom: 12,
        paddingLeft: 16,
      },
      ordered_list: {
        marginBottom: 12,
        paddingLeft: 16,
      },
      list_item: {
        color: colors.text,
        lineHeight: 24,
      },
      link: {
        color: (colors as any).accent || colors.tint,
      },
      code_inline: {
        backgroundColor: colors.card,
        color: colors.text,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
      },
    }),
    [colors]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.content}
        contentInsetAdjustmentBehavior='automatic'
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={t('legal:title')}
          subtitle={t('legal:subtitle')}
          showBackButton
          onBack={() => router.back()}
        />

        <View style={styles.body}>
          <Markdown style={markdownStyles}>{t('legal:content')}</Markdown>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
});
