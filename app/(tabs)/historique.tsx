import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { getToneLabel, resolveToneKey } from '@/constants/tones';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEnsureNamespaces } from '@/hooks/useEnsureNamespaces';
import {
  deletePrompt,
  getAllPrompts,
  SavedPrompt,
} from '@/services/promptService';
import { ScreenHeader } from '@/components/screen-header';

function PromptCard({
  prompt,
  onPress,
  onDelete,
  colors,
}: {
  prompt: SavedPrompt;
  onPress: () => void;
  onDelete: () => void;
  colors: any;
}) {
  const { t, i18n } = useTranslation(['common', 'history']);
  const truncatedRequest =
    prompt.mainRequest.length > 80
      ? prompt.mainRequest.substring(0, 80) + '...'
      : prompt.mainRequest;
  const locale = useMemo(
    () => (i18n.language.startsWith('en') ? 'en-US' : 'fr-FR'),
    [i18n.language]
  );
  const toneKey = resolveToneKey(prompt.tone);
  const toneLabel = toneKey ? getToneLabel(toneKey, t) : prompt.tone;
  const formattedDate = useMemo(
    () => new Date(prompt.createdAt).toLocaleDateString(locale),
    [prompt.createdAt, locale]
  );

  return (
    <TouchableOpacity
      style={[
        styles.promptCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <ThemedText style={[styles.promptName, { color: colors.text }]}>
          {prompt.name}
        </ThemedText>
        <View style={styles.dateAndActions}>
          <ThemedText style={[styles.promptDate, { color: colors.icon }]}>
            {formattedDate}
          </ThemedText>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol name='trash' size={16} color='#ff4444' />
          </TouchableOpacity>
        </View>
      </View>

      <ThemedText style={[styles.promptPreview, { color: colors.icon }]}>
        {truncatedRequest}
      </ThemedText>

      <View style={styles.cardFooter}>
        <ThemedText style={[styles.promptTone, { color: colors.tint }]}>
          {toneLabel}
        </ThemedText>
        <IconSymbol name='chevron.right' size={16} color={colors.icon} />
      </View>
    </TouchableOpacity>
  );
}

export default function HistoriqueScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  useEnsureNamespaces('common', 'history');
  const { t } = useTranslation(['common', 'history']);

  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPrompts = useCallback(async () => {
    try {
      const savedPrompts = await getAllPrompts();
      const sortedPrompts = savedPrompts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPrompts(sortedPrompts);
    } catch (error) {
      console.error('Erreur lors du chargement des prompts:', error);
      Alert.alert(t('common.status.error'), t('history:errors.load'));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPrompts();
  }, [loadPrompts]);

  const handlePromptPress = (prompt: SavedPrompt) => {
    router.push({
      pathname: '/generated',
      params: {
        promptId: prompt.id,
        source: 'history',
      },
    });
  };

  const handleDeletePrompt = useCallback(
    (prompt: SavedPrompt) => {
      Alert.alert(
        t('history:deleteTitle'),
        t('history:deleteMessage', { name: prompt.name }),
        [
          {
            text: t('common.actions.cancel'),
            style: 'cancel',
          },
          {
            text: t('common.actions.delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                await deletePrompt(prompt.id);
                console.log(`🗑️ Prompt "${prompt.name}" supprimé`);
                // Recharger la liste après suppression
                loadPrompts();
              } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                Alert.alert(
                  t('common.status.error'),
                  t('history:errors.delete')
                );
              }
            },
          },
        ]
      );
    },
    [loadPrompts, t]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol
        name='doc.text'
        size={64}
        color={colors.icon}
        style={styles.emptyIcon}
      />
      <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
        {t('history:emptyTitle')}
      </ThemedText>
      <ThemedText style={[styles.emptyDescription, { color: colors.icon }]}>
        {t('history:emptyDescription')}
      </ThemedText>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.tint }]}
        onPress={() => router.push('/(tabs)/prompt')}
      >
        <ThemedText style={[styles.createButtonText, { color: '#fff' }]}>
          {t('common.actions.createPrompt')}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScreenHeader
        title={t('history:title')}
        subtitle={t('history:subtitle', { count: prompts.length })}
      />

      <FlatList
        data={prompts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PromptCard
            prompt={item}
            onPress={() => handlePromptPress(item)}
            onDelete={() => handleDeletePrompt(item)}
            colors={colors}
          />
        )}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        contentContainerStyle={
          prompts.length === 0
            ? styles.emptyListContainer
            : styles.listContainer
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  promptCard: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  promptName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  dateAndActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promptDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  deleteButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  promptPreview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promptTone: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
