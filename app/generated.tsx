import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
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
import {
  getPromptById,
  SavedPrompt,
  updatePrompt,
} from '@/services/promptService';

// Plateformes IA disponibles
const AI_PLATFORMS = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    // PRIORITÉ : APP NATIVE VIA STORE !
    iosStore: 'https://apps.apple.com/app/chatgpt/id1448792446',
    androidStore:
      'https://play.google.com/store/apps/details?id=com.openai.chatgpt',
    webFallback: 'https://chatgpt.com/',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    // PRIORITÉ : APP NATIVE VIA STORE !
    iosStore: 'https://apps.apple.com/app/gemini-ai-assistant/id1596370896',
    androidStore:
      'https://play.google.com/store/apps/details?id=com.google.android.apps.bard',
    webFallback: 'https://gemini.google.com/',
  },
  {
    id: 'grok',
    name: 'Grok - Assistant IA',
    // APP xAI séparée → STORE DIRECT !
    iosStore: 'https://apps.apple.com/app/grok/id6499194723',
    androidStore: 'https://play.google.com/store/apps/details?id=ai.x.grok',
    webFallback: 'https://x.ai/',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    // SCHEMES NATIFS ÉPROUVÉS → APP DIRECTE !
    iosScheme: 'twitter://',
    androidScheme: 'twitter://',
    iosStore: 'https://apps.apple.com/app/x/id333903271',
    androidStore:
      'https://play.google.com/store/apps/details?id=com.twitter.android',
    webFallback: 'https://twitter.com/',
  },
];

export default function GeneratedScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  const { promptId, source } = useLocalSearchParams<{
    promptId: string;
    source?: string;
  }>();

  const [prompt, setPrompt] = useState<SavedPrompt | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedPrompt, setEditedPrompt] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState(AI_PLATFORMS[0]);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger le prompt
  useEffect(() => {
    loadPrompt();
  }, [promptId]);

  // Détecter les changements
  useEffect(() => {
    if (prompt) {
      const nameChanged = editedName !== prompt.name;
      const promptChanged = editedPrompt !== prompt.generatedPrompt;
      setHasChanges(nameChanged || promptChanged);
    }
  }, [editedName, editedPrompt, prompt]);

  const loadPrompt = async () => {
    try {
      if (promptId) {
        const loadedPrompt = await getPromptById(promptId);
        if (loadedPrompt) {
          setPrompt(loadedPrompt);
          setEditedName(loadedPrompt.name);
          setEditedPrompt(loadedPrompt.generatedPrompt);
        } else {
          Alert.alert('Erreur', 'Prompt non trouvé');
          router.back();
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger le prompt');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!prompt) return;

    try {
      await updatePrompt(prompt.id, {
        promptName: editedName.trim(),
        // On peut ajouter d'autres champs si nécessaire
      });

      // Mettre à jour l'état local
      setPrompt((prev) =>
        prev
          ? { ...prev, name: editedName.trim(), updatedAt: new Date() }
          : null
      );
      setHasChanges(false);

      Alert.alert('Succès', 'Prompt sauvegardé avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(editedPrompt);
      Alert.alert('Copié !', 'Le prompt a été copié dans le presse-papiers');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de copier le prompt');
    }
  };

  const handleGoToPlatform = async () => {
    const platform = selectedPlatform;
    const isIOS = Platform.OS === 'ios';
    const isAndroid = Platform.OS === 'android';
    const isWeb = Platform.OS === 'web';

    console.log(`🚀 PRIORITÉ APP NATIVE - ${platform.name} sur ${Platform.OS}`);

    try {
      // ═══ WEB : Ouverture simple ═══
      if (isWeb) {
        const webUrl = platform.webFallback;
        console.log(`🌐 Web: ${webUrl}`);
        window.open(webUrl, '_blank');
        console.log(`✅ ${platform.name} ouvert dans nouvel onglet !`);
        return;
      }

      // ═══ MOBILE : STRATÉGIE AGRESSIVE POUR APP NATIVE ═══

      // ÉTAPE 1 : Essayer scheme natif direct (Twitter/X)
      if (platform.iosScheme || platform.androidScheme) {
        const nativeScheme = isIOS
          ? platform.iosScheme
          : platform.androidScheme;

        if (nativeScheme) {
          try {
            console.log(`📱 TENTATIVE 1: Scheme natif → ${nativeScheme}`);
            await Linking.openURL(nativeScheme);
            console.log(`🎯 SUCCÈS ! ${platform.name} ouvert via APP NATIVE !`);
            return;
          } catch (schemeError) {
            console.log(`❌ Scheme natif échoué, passage à l'étape 2...`);
          }
        }
      }

      // ÉTAPE 2 : Redirection STORE pour installer l'app (ChatGPT/Gemini)
      const storeUrl = isIOS ? platform.iosStore : platform.androidStore;
      if (storeUrl) {
        console.log(`🏪 TENTATIVE 2: Redirection STORE → ${storeUrl}`);

        Alert.alert(
          `${platform.name} App`,
          `Voulez-vous installer l'app ${platform.name} pour une meilleure expérience ?`,
          [
            {
              text: 'Installer App',
              onPress: async () => {
                try {
                  await Linking.openURL(storeUrl);
                  console.log(
                    `🎯 STORE ouvert pour installer ${platform.name} !`
                  );
                } catch (storeError) {
                  console.log(`❌ Store échoué, fallback web...`);
                  await Linking.openURL(platform.webFallback);
                }
              },
            },
            {
              text: 'Utiliser Web',
              onPress: async () => {
                await Linking.openURL(platform.webFallback);
                console.log(`🌐 ${platform.name} ouvert dans navigateur`);
              },
            },
          ]
        );
        return;
      }

      // ÉTAPE 3 : Fallback web (si pas de store configuré)
      console.log(`🌐 FALLBACK: Ouverture web → ${platform.webFallback}`);
      await Linking.openURL(platform.webFallback);
      console.log(`✅ ${platform.name} ouvert dans navigateur`);
    } catch (error) {
      console.error('💥 ERREUR CRITIQUE:', error);
      Alert.alert('Erreur', `Impossible d'ouvrir ${platform.name}`);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Modifications non sauvegardées',
        'Voulez-vous sauvegarder vos modifications avant de quitter ?',
        [
          {
            text: 'Quitter sans sauvegarder',
            onPress: () => router.back(),
            style: 'destructive',
          },
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Sauvegarder',
            onPress: async () => {
              await handleSave();
              router.back();
            },
          },
        ]
      );
    } else {
      // Retour intelligent : formulaire si source='form', historique sinon
      if (source === 'form') {
        router.push('/(tabs)/prompt');
      } else {
        router.push('/(tabs)/historique');
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={{ color: colors.text }}>Chargement...</ThemedText>
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
            Prompt non trouvé
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
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name='chevron.left' size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type='title' style={styles.headerTitle}>
          Prompt généré
        </ThemedText>
        <ThemedView style={styles.headerSpacer} />
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Nom du prompt */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            Nom du prompt :
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
            placeholder='Nom du prompt'
            placeholderTextColor={colors.icon}
          />
        </ThemedView>

        {/* Prompt généré */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            Prompt généré :
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
            placeholder='Contenu du prompt...'
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
              Enregistrer les modifications
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
            Copier le prompt
          </ThemedText>
        </TouchableOpacity>

        {/* Sélection plateforme IA */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            📱 Ouvrir dans :
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

        {/* Bouton Aller vers */}
        <TouchableOpacity
          style={[
            styles.goButton,
            { backgroundColor: (colors as any).purple || '#6366f1' },
          ]}
          onPress={handleGoToPlatform}
        >
          <ThemedText style={[styles.goButtonText, { color: '#fff' }]}>
            📱 Ouvrir {selectedPlatform.name}
          </ThemedText>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
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
    gap: 12,
  },
  platformButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  platformText: {
    fontSize: 14,
    fontWeight: '500',
  },
  goButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 40,
  },
  goButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
