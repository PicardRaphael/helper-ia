import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  PanResponder,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createPrompt, PromptFormData } from '@/services/promptService';
// Liste des tons selon project.md
const TONES = [
  'Neutre / factuel',
  'Professionnel / corporate',
  'No-bullshit / direct',
  'Assertif',
  'Technique – niveau expert',
  'Technique – pédagogique',
  'Amical / décontracté',
  'Enthousiaste / motivant',
  'Créatif / inspirant',
  'Humoristique / léger',
  'Empathique / bienveillant',
  'Authorité / expert',
  'Vendeur / persuasif',
  'Éducatif / informatif',
  'Storytelling / narratif',
];

// Composant InputWithMicrophone (DÉPLACÉ EN DEHORS pour éviter les re-renders)
const InputWithMicrophone = React.memo(
  ({
    value,
    onChangeText,
    placeholder,
    multiline = false,
    numberOfLines,
    fieldName,
    style,
  }: {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    numberOfLines?: number;
    fieldName: string;
    style?: any;
  }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];
    const [isListening, setIsListening] = useState<string | null>(null);

    // Fonction pour démarrer la reconnaissance vocale
    const startVoiceRecognition = async (fieldName: string) => {
      try {
        if (isListening) {
          console.log('Reconnaissance déjà en cours');
          return;
        }

        console.log('Démarrage reconnaissance pour:', fieldName);
        setIsListening(fieldName);

        // Simuler 2 secondes d'écoute puis ajouter texte
        setTimeout(() => {
          const currentValue = value || '';
          const newText = currentValue ? currentValue + ' Test' : 'Test';
          onChangeText(newText);
          setIsListening(null);
          Alert.alert('✅ Test', 'Simulation réussie - écrit "Test"');
        }, 2000);
      } catch (error) {
        console.error('Erreur démarrage reconnaissance:', error);
        Alert.alert('Erreur', 'Reconnaissance vocale non disponible');
        setIsListening(null);
      }
    };

    return (
      <View style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.icon}
          style={[
            multiline ? styles.textArea : styles.textInput,
            {
              color: colors.text,
              backgroundColor: colors.card,
              borderColor: colors.border,
              paddingRight: 56,
            },
            style,
          ]}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        <TouchableOpacity
          style={[
            styles.micButton,
            {
              backgroundColor:
                isListening === fieldName ? '#ff6b6b' : colors.tint,
            },
          ]}
          onPress={() => startVoiceRecognition(fieldName)}
        >
          <IconSymbol
            name='mic.fill'
            size={18}
            color={isListening === fieldName ? '#fff' : '#fff'}
          />
        </TouchableOpacity>
      </View>
    );
  }
);

export default function PromptScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();

  // États du formulaire selon project.md
  const [promptName, setPromptName] = useState('');
  const [mainRequest, setMainRequest] = useState('');
  const [role, setRole] = useState('');
  const [context, setContext] = useState('');
  const [exampleStyle, setExampleStyle] = useState('');
  const [responseFormat, setResponseFormat] = useState('');
  const [selectedTone, setSelectedTone] = useState(TONES[0]);
  const [loading, setLoading] = useState(false);
  const [showTonePicker, setShowTonePicker] = useState(false);

  // Animation pour swipe down
  const modalTranslateY = useRef(new Animated.Value(0)).current;

  // PanResponder pour gérer le swipe down
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          gestureState.dy > 0 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          modalTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          // Si on glisse plus de 100px vers le bas, on ferme
          closeModalWithAnimation();
        } else {
          // Sinon on remet en place
          Animated.spring(modalTranslateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const closeModalWithAnimation = () => {
    Animated.timing(modalTranslateY, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowTonePicker(false);
      modalTranslateY.setValue(0);
    });
  };

  // Validation des champs obligatoires
  const validateForm = () => {
    if (!promptName.trim()) {
      Alert.alert('Erreur', 'Le nom du prompt est obligatoire');
      return false;
    }
    if (!mainRequest.trim()) {
      Alert.alert('Erreur', 'La demande principale est obligatoire');
      return false;
    }
    return true;
  };

  // Fonction d'envoi selon project.md
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Préparer les données pour le service
      const formData: PromptFormData = {
        promptName,
        mainRequest,
        role,
        context,
        exampleStyle,
        responseFormat,
        selectedTone,
      };

      // Créer et sauvegarder le prompt
      const savedPrompt = await createPrompt(formData);

      // Réinitialiser le formulaire
      setPromptName('');
      setMainRequest('');
      setRole('');
      setContext('');
      setExampleStyle('');
      setResponseFormat('');
      setSelectedTone(TONES[0]);

      // Navigation vers l'écran "Prompt généré" (après reset du form)
      router.push({
        pathname: '/generated' as any,
        params: {
          promptId: savedPrompt.id,
          // Pas de fromHistory = retour au formulaire par défaut
        },
      });
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la création du prompt'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type='title' style={styles.headerTitle}>
          Créer un Prompt
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Nom du prompt - OBLIGATOIRE */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            Nom du prompt <ThemedText style={{ color: 'red' }}>*</ThemedText>
          </ThemedText>
          <InputWithMicrophone
            value={promptName}
            onChangeText={setPromptName}
            placeholder='Ex: Email de relance client'
            fieldName='promptName'
          />
        </ThemedView>

        {/* Demande principale - OBLIGATOIRE */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            Demande principale{' '}
            <ThemedText style={{ color: 'red' }}>*</ThemedText>
          </ThemedText>
          <InputWithMicrophone
            value={mainRequest}
            onChangeText={setMainRequest}
            placeholder="Décrivez ce que vous voulez que l'IA génère..."
            fieldName='mainRequest'
            multiline
            numberOfLines={4}
          />
        </ThemedView>

        {/* Rôle - OPTIONNEL */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            Rôle (optionnel)
          </ThemedText>
          <InputWithMicrophone
            value={role}
            onChangeText={setRole}
            placeholder='Ex: Tu es un expert en marketing digital'
            fieldName='role'
          />
        </ThemedView>

        {/* Contexte - OPTIONNEL */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            Contexte (optionnel)
          </ThemedText>
          <InputWithMicrophone
            value={context}
            onChangeText={setContext}
            placeholder='Informations de contexte importantes...'
            fieldName='context'
            multiline
            numberOfLines={3}
          />
        </ThemedView>

        {/* Exemple/Style - OPTIONNEL */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            Exemple/Style (optionnel)
          </ThemedText>
          <InputWithMicrophone
            value={exampleStyle}
            onChangeText={setExampleStyle}
            placeholder='Exemples de style ou format souhaité...'
            fieldName='exampleStyle'
            multiline
            numberOfLines={3}
          />
        </ThemedView>

        {/* Format de réponse - OPTIONNEL */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            Format de réponse (optionnel)
          </ThemedText>
          <InputWithMicrophone
            value={responseFormat}
            onChangeText={setResponseFormat}
            placeholder='Ex: Liste à puces, JSON, paragraphe...'
            fieldName='responseFormat'
          />
        </ThemedView>

        {/* Ton - PICKER */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            Ton
          </ThemedText>
          <TouchableOpacity
            style={[
              styles.dropdown,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowTonePicker(true)}
          >
            <ThemedText style={[styles.dropdownText, { color: colors.text }]}>
              {selectedTone}
            </ThemedText>
            <IconSymbol name='chevron.right' size={16} color={colors.icon} />
          </TouchableOpacity>
        </ThemedView>

        {/* Bouton Envoyer */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: (colors as any).purple || '#6366f1',
              opacity: loading ? 0.7 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <ThemedText style={[styles.submitButtonText, { color: '#fff' }]}>
            {loading ? 'Création en cours...' : 'Envoyer'}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Picker de Ton */}
      <Modal
        visible={showTonePicker}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setShowTonePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTonePicker(false)}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.background,
                transform: [{ translateY: modalTranslateY }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            {/* Header avec poignée */}
            <ThemedView style={styles.modalHandle}>
              <ThemedView
                style={[styles.handle, { backgroundColor: colors.border }]}
              />
            </ThemedView>

            <ThemedView style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                Choisir un ton
              </ThemedText>
            </ThemedView>

            <FlatList
              data={TONES}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.toneItem,
                    {
                      backgroundColor:
                        selectedTone === item
                          ? ((colors as any).accent || colors.tint) + '20' // Version transparente
                          : 'transparent',
                      borderColor:
                        selectedTone === item
                          ? (colors as any).accent || colors.tint
                          : colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedTone(item);
                    closeModalWithAnimation();
                  }}
                >
                  {selectedTone === item && (
                    <ThemedView
                      style={[
                        styles.checkIcon,
                        {
                          backgroundColor:
                            (colors as any).accent || colors.tint,
                        },
                      ]}
                    >
                      <ThemedText
                        style={{
                          color: '#000',
                          fontSize: 12,
                          fontWeight: 'bold',
                          textAlign: 'center',
                          lineHeight: 20,
                        }}
                      >
                        ✓
                      </ThemedText>
                    </ThemedView>
                  )}
                  <ThemedText
                    style={[
                      styles.toneText,
                      {
                        color:
                          selectedTone === item
                            ? (colors as any).accent || colors.tint
                            : colors.text,
                        fontWeight: selectedTone === item ? '600' : '400',
                      },
                    ]}
                  >
                    {item}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 50,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
  },
  inputContainer: {
    position: 'relative',
  },
  micButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  dropdownText: {
    fontSize: 16,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
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
    padding: 0,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHandle: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  toneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    position: 'relative',
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    display: 'flex',
  },
  toneText: {
    fontSize: 16,
    flex: 1,
  },
});
