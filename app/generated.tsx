import * as Clipboard from 'expo-clipboard';
import * as IntentLauncher from 'expo-intent-launcher';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEnsureNamespaces } from '@/hooks/useEnsureNamespaces';
import {
  getPromptById,
  PromptValidationError,
  SavedPrompt,
  updatePrompt,
} from '@/services/promptService';
import { ScreenHeader } from '@/components/screen-header';

// Interface pour les plateformes IA
interface AIPlatform {
  id: string;
  name: string;
  icon: string; // Emoji fallback
  logo?: any; // Logo SVG/PNG
  color: string;
  iosStore: string;
  androidStore: string;
  webFallback: string;
  iosScheme?: string;
  androidPackage?: string;
  androidActivity?: string; // Nom complet de l'activity LAUNCHER
}

// Plateformes IA disponibles
const AI_PLATFORMS: AIPlatform[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    logo: require('@/assets/images/logos/chatgpt.png'),
    icon: '🤖', // Fallback emoji
    color: '#10a37f', // Couleur officielle OpenAI
    // PRIORITÉ : APP NATIVE VIA STORE !
    iosStore: 'https://apps.apple.com/app/chatgpt/id1448792446',
    androidStore:
      'https://play.google.com/store/apps/details?id=com.openai.chatgpt',
    webFallback: 'https://chatgpt.com/',
    iosScheme: 'chatgpt://',
    androidPackage: 'com.openai.chatgpt',
    androidActivity: 'com.openai.chatgpt.MainActivity',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    logo: require('@/assets/images/logos/gemini.png'),
    icon: '✨', // Fallback emoji
    color: '#4285f4', // Couleur Google Blue
    // PRIORITÉ : APP NATIVE VIA STORE !
    iosStore: 'https://apps.apple.com/app/gemini-ai-assistant/id1596370896',
    androidStore:
      'https://play.google.com/store/apps/details?id=com.google.android.apps.bard',
    webFallback: 'https://gemini.google.com/',
    // Note: certaines installs iOS exposent googleapp:// (Google app)
    iosScheme: 'googleapp://',
    androidPackage: 'com.google.android.apps.bard',
    androidActivity:
      'com.google.android.apps.bard.shellapp.BardEntryPointActivity',
  },
  {
    id: 'grok',
    name: 'Grok',
    logo: require('@/assets/images/logos/grok.png'),
    icon: '🚀', // Fallback emoji
    color: '#1da1f2', // Couleur X/Twitter
    // APP xAI séparée → STORE DIRECT !
    iosStore: 'https://apps.apple.com/app/grok/id6499194723',
    androidStore: 'https://play.google.com/store/apps/details?id=ai.x.grok',
    webFallback: 'https://x.ai/',
    // Scheme iOS non public documenté; on tente store si échec
    androidPackage: 'ai.x.grok',
    androidActivity: 'ai.x.grok.main.GrokActivity',
  },
];

export default function GeneratedScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  useEnsureNamespaces('common', 'generated');
  const { t } = useTranslation(['common', 'generated']);
  const { promptId, source } = useLocalSearchParams<{
    promptId: string;
    source?: 'form' | 'history';
  }>();

  const [prompt, setPrompt] = useState<SavedPrompt | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedPrompt, setEditedPrompt] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState(AI_PLATFORMS[0]);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPlatformModal, setShowPlatformModal] = useState(false);

  // Détecter les changements
  useEffect(() => {
    if (prompt) {
      const nameChanged = editedName !== prompt.name;
      const promptChanged = editedPrompt !== prompt.generatedPrompt;
      setHasChanges(nameChanged || promptChanged);
    }
  }, [editedName, editedPrompt, prompt]);

  const loadPrompt = useCallback(async () => {
    try {
      if (promptId) {
        const loadedPrompt = await getPromptById(promptId);
        if (loadedPrompt) {
          setPrompt(loadedPrompt);
          setEditedName(loadedPrompt.name);
          setEditedPrompt(loadedPrompt.generatedPrompt);
        } else {
          Alert.alert(
            t('common.status.error'),
            t('generated:empty.notFound')
          );
          router.back();
        }
      }
    } catch (error) {
      console.error('Erreur chargement prompt:', error);
      Alert.alert(
        t('common.status.error'),
        t('generated:alerts.loadError')
      );
      router.back();
    } finally {
      setLoading(false);
    }
  }, [promptId, router, t]);

  // Charger le prompt
  useEffect(() => {
    loadPrompt();
  }, [loadPrompt]);

  const handleSave = async () => {
    if (!prompt) return;

    const trimmedName = editedName.trim();
    const trimmedPrompt = editedPrompt.trim();

    if (!trimmedName) {
      Alert.alert(
        t('common.status.error'),
        t('generated:alerts.validationName')
      );
      return;
    }

    if (!trimmedPrompt) {
      Alert.alert(
        t('common.status.error'),
        t('generated:alerts.validationPrompt')
      );
      return;
    }

    try {
      await updatePrompt(prompt.id, {
        promptName: trimmedName,
        generatedPrompt: trimmedPrompt,
      });

      setPrompt((prev) =>
        prev
          ? {
              ...prev,
              name: trimmedName,
              generatedPrompt: trimmedPrompt,
              updatedAt: new Date(),
            }
          : null
      );
      setEditedName(trimmedName);
      setEditedPrompt(trimmedPrompt);
      setHasChanges(false);

      Alert.alert(
        t('common.status.success'),
        t('generated:alerts.saveSuccess')
      );
    } catch (error) {
      console.error('Erreur sauvegarde prompt:', error);
      if (error instanceof PromptValidationError) {
        const messageKey =
          error.code === 'promptNameRequired'
            ? 'generated:alerts.validationName'
            : 'generated:alerts.validationPrompt';
        Alert.alert(t('common.status.error'), t(messageKey));
        return;
      }
      Alert.alert(
        t('common.status.error'),
        t('generated:alerts.saveError')
      );
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(editedPrompt);
      Alert.alert(
        t('common.status.success'),
        t('generated:alerts.copySuccess')
      );
    } catch (error) {
      console.error('Erreur copie prompt:', error);
      Alert.alert(
        t('common.status.error'),
        t('generated:alerts.copyError')
      );
    }
  };

  const handleGoToPlatform = () => {
    setShowPlatformModal(true);
  };

  const handleGoToApp = async () => {
    const platform = selectedPlatform;
    const isIOS = Platform.OS === 'ios';
    const isAndroid = Platform.OS === 'android';

    console.log(
      `📱 TENTATIVE APP NATIVE - ${platform.name} sur ${Platform.OS}`
    );
    setShowPlatformModal(false); // Fermer la modal

    try {
      // iOS: tenter d'abord le scheme spécifique si présent
      if (isIOS && platform.iosScheme) {
        try {
          console.log(`📱 iOS scheme → ${platform.iosScheme}`);
          const canOpen = await Linking.canOpenURL(platform.iosScheme);
          if (canOpen) {
            await Linking.openURL(platform.iosScheme);
            return;
          }
        } catch (error) {
          console.log('Scheme iOS indisponible:', error);
        }
      }

      // Android: ouverture explicite du composant LAUNCHER si connu
      if (isAndroid && platform.androidPackage) {
        if (platform.androidActivity) {
          try {
            console.log(
              `🤖 Android COMPONENT → ${platform.androidPackage}/${platform.androidActivity}`
            );
            await IntentLauncher.startActivityAsync(
              'android.intent.action.MAIN',
              {
                category: 'android.intent.category.LAUNCHER',
                packageName: platform.androidPackage,
                className: platform.androidActivity,
                flags: 268435456, // FLAG_ACTIVITY_NEW_TASK
              } as any
            );
            return;
          } catch (componentErr) {
            console.log(
              '❌ COMPONENT échoué, tentative MAIN package',
              componentErr
            );
          }
        }
        // Fallback: tenter MAIN sur le package
        try {
          console.log(`🤖 Android MAIN → ${platform.androidPackage}`);
          await IntentLauncher.startActivityAsync(
            'android.intent.action.MAIN',
            {
              category: 'android.intent.category.LAUNCHER',
              packageName: platform.androidPackage,
              flags: 268435456, // FLAG_ACTIVITY_NEW_TASK
            } as any
          );
          return;
        } catch (intentErr) {
          console.log(`❌ MAIN échoué, on proposera le store : ${intentErr}`);
        }
      }

      // ÉTAPE 3 : Si app pas installée, proposer le store
      const storeUrl = isIOS ? platform.iosStore : platform.androidStore;
      if (storeUrl) {
        Alert.alert(
          t('generated:alerts.platformNotInstalledTitle', {
            platform: platform.name,
          }),
          t('generated:alerts.platformNotInstalledMessage', {
            platform: platform.name,
          }),
          [
            { text: t('common.actions.cancel'), style: 'cancel' },
            {
              text: t('common.actions.install'),
              onPress: async () => {
                try {
                  await Linking.openURL(storeUrl);
                  console.log(
                    `🎯 STORE ouvert pour installer ${platform.name} !`
                  );
                } catch (storeError) {
                  console.log(storeError);
                  Alert.alert(
                    t('common.status.error'),
                    t('generated:alerts.platformStoreError')
                  );
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          t('generated:alerts.platformNotAvailableTitle'),
          t('generated:alerts.platformNotAvailableMessage', {
            platform: platform.name,
          })
        );
      }
    } catch (error) {
      console.error('💥 ERREUR APP:', error);
      Alert.alert(
        t('common.status.error'),
        t('generated:alerts.platformOpenError', {
          platform: platform.name,
        })
      );
    }
  };

  const handleGoToWeb = async () => {
    const platform = selectedPlatform;
    console.log(`🌐 OUVERTURE WEB - ${platform.name}`);
    setShowPlatformModal(false); // Fermer la modal

    try {
      await Linking.openURL(platform.webFallback);
      console.log(`✅ ${platform.name} ouvert dans navigateur`);
    } catch (error) {
      console.error('💥 ERREUR WEB:', error);
      Alert.alert(
        t('common.status.error'),
        t('generated:alerts.webOpenError', { platform: platform.name })
      );
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        t('generated:alerts.unsavedTitle'),
        t('generated:alerts.unsavedMessage'),
        [
          {
            text: t('generated:alerts.unsavedDiscard'),
            onPress: () => router.back(),
            style: 'destructive',
          },
          { text: t('common.actions.cancel'), style: 'cancel' },
          {
            text: t('generated:alerts.unsavedSave'),
            onPress: async () => {
              await handleSave();
              router.back();
            },
          },
        ]
      );
    } else {
      // Retour intelligent : formulaire si source='form', historique sinon
      if (source === 'history') {
        router.push('/(tabs)/historique');
      } else {
        router.push('/(tabs)/prompt');
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={{ color: colors.text }}>
            {t('generated:empty.loading')}
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!prompt) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={{ color: colors.text }}>
            {t('generated:empty.notFound')}
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <ScreenHeader
        title={t('generated:title')}
        showBackButton
        onBack={handleBack}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Nom du prompt */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            {t('generated:fields.nameLabel')}{' '}
            <ThemedText style={{ color: 'red' }}>*</ThemedText>
          </ThemedText>
          <TextInput
            style={[
              styles.nameInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={editedName}
            onChangeText={setEditedName}
            placeholder={t('generated:fields.namePlaceholder')}
            placeholderTextColor={colors.icon}
          />
        </ThemedView>

        {/* Prompt généré */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            {t('generated:fields.promptLabel')}{' '}
            <ThemedText style={{ color: 'red' }}>*</ThemedText>
          </ThemedText>
          <TextInput
            style={[
              styles.promptTextArea,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={editedPrompt}
            onChangeText={setEditedPrompt}
            multiline
            numberOfLines={12}
            textAlignVertical='top'
            placeholder={t('generated:fields.promptPlaceholder')}
            placeholderTextColor={colors.icon}
          />
        </ThemedView>

        {/* Bouton Enregistrer (conditionnel) */}
        {hasChanges && (
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: (colors as any).accent || colors.tint },
            ]}
            onPress={handleSave}
          >
            <ThemedText style={[styles.saveButtonText, { color: '#000' }]}>
              {t('generated:actions.saveChanges')}
            </ThemedText>
          </TouchableOpacity>
        )}

        {/* Bouton Copier */}
        <TouchableOpacity
          style={[
            styles.copyButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={handleCopy}
        >
          <IconSymbol name='doc.text' size={20} color={colors.text} />
          <ThemedText style={[styles.copyButtonText, { color: colors.text }]}>
            {t('generated:actions.copyPrompt')}
          </ThemedText>
        </TouchableOpacity>

        {/* Sélection plateforme IA */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            {t('generated:actions.openIn')}
          </ThemedText>
          <ThemedView style={styles.platformContainer}>
            {AI_PLATFORMS.map((platform) => (
              <TouchableOpacity
                key={platform.id}
                style={[
                  styles.platformButton,
                  {
                    backgroundColor:
                      selectedPlatform.id === platform.id
                        ? ((colors as any).accent || colors.tint) + '20'
                        : colors.card,
                    borderColor:
                      selectedPlatform.id === platform.id
                        ? (colors as any).accent || colors.tint
                        : colors.border,
                  },
                ]}
                onPress={() => setSelectedPlatform(platform)}
              >
                <Image
                  source={platform.logo}
                  style={styles.platformLogo}
                  resizeMode='contain'
                />

                <ThemedText
                  style={[
                    styles.platformText,
                    {
                      color:
                        selectedPlatform.id === platform.id
                          ? (colors as any).accent || colors.tint
                          : colors.text,
                    },
                  ]}
                >
                  {platform.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Bouton d'ouverture */}
        <TouchableOpacity
          style={[
            styles.goButton,
            { backgroundColor: selectedPlatform.color || '#6366f1' },
          ]}
          onPress={handleGoToPlatform}
        >
          {selectedPlatform.logo ? (
            <ThemedView style={styles.goButtonContent}>
              <Image
                source={selectedPlatform.logo}
                style={styles.goButtonLogo}
                resizeMode='contain'
              />
              <ThemedText style={[styles.goButtonText, { color: '#fff' }]}>
                {t('generated:actions.goTo', {
                  name: selectedPlatform.name,
                })}
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedText style={[styles.goButtonText, { color: '#fff' }]}>
              {selectedPlatform.icon}{' '}
              {t('generated:actions.goTo', {
                name: selectedPlatform.name,
              })}
            </ThemedText>
          )}
        </TouchableOpacity>

        {/* Modal de choix */}
        <Modal
          visible={showPlatformModal}
          transparent={true}
          animationType='slide'
          onRequestClose={() => setShowPlatformModal(false)}
        >
          <ThemedView style={styles.modalOverlay}>
            <ThemedView
              style={[styles.modalContent, { backgroundColor: colors.card }]}
            >
              {/* Header */}
              <ThemedView style={styles.modalHeader}>
                <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                  {t('generated:actions.goTo', {
                    name: selectedPlatform.name,
                  })}
                </ThemedText>
              </ThemedView>

              {/* Options */}
              <ThemedView style={styles.modalOptions}>
                {/* Bouton App */}
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: selectedPlatform.color || '#6366f1' },
                  ]}
                  onPress={handleGoToApp}
                >
                  {selectedPlatform.logo && (
                    <Image
                      source={selectedPlatform.logo}
                      style={styles.modalButtonLogo}
                      resizeMode='contain'
                    />
                  )}
                  <ThemedText
                    style={[styles.modalButtonText, { color: '#fff' }]}
                  >
                    {t('generated:actions.appButton')}
                  </ThemedText>
                  <ThemedText
                    style={[styles.modalButtonSubtext, { color: '#fff' }]}
                  >
                    {t('generated:actions.appSubtitle')}
                  </ThemedText>
                </TouchableOpacity>

                {/* Bouton Web */}
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.modalButtonSecondary,
                    { borderColor: selectedPlatform.color || '#6366f1' },
                  ]}
                  onPress={handleGoToWeb}
                >
                  <ThemedText
                    style={[
                      styles.modalButtonText,
                      { color: selectedPlatform.color || '#6366f1' },
                    ]}
                  >
                    {t('generated:actions.webButton')}
                  </ThemedText>
                  <ThemedText
                    style={[styles.modalButtonSubtext, { color: colors.text }]}
                  >
                    {t('generated:actions.webSubtitle')}
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>

              {/* Bouton Annuler */}
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowPlatformModal(false)}
              >
                <ThemedText
                  style={[styles.modalCancelText, { color: colors.text }]}
                >
                  {t('generated:actions.cancel')}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  promptTextArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 250,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  platformContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  platformButton: {
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxWidth: '48%', // Deux par ligne max
  },
  platformIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  platformLogo: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  goButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 40,
  },
  goButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  goButtonLogo: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  goButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '50%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOptions: {
    gap: 16,
    marginBottom: 24,
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
  },
  modalButtonSecondary: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  modalButtonLogo: {
    width: 24,
    height: 24,
    marginBottom: 6,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  modalButtonSubtext: {
    fontSize: 12,
    opacity: 0.8,
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
