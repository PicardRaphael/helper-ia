import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  PanResponder,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { TONE_KEYS, type ToneKey, getToneLabel } from '@/constants/tones';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEnsureNamespaces } from '@/hooks/useEnsureNamespaces';
import { createPrompt, PromptFormData } from '@/services/promptService';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
const InputWithMicrophone = React.memo(
  ({
    value,
    onChangeText,
    placeholder,
    multiline = false,
    numberOfLines,
    fieldName,
    style,
    onStartListening,
    isListening,
    isActive,
    listeningLabel,
  }: {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    numberOfLines?: number;
    fieldName: string;
    style?: any;
    onStartListening: (
      field: string,
      callback: (text: string) => void
    ) => Promise<void> | void;
    isListening: boolean;
    isActive: boolean;
    listeningLabel: string;
  }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];

    const handlePress = useCallback(() => {
      onStartListening(fieldName, onChangeText);
    }, [fieldName, onChangeText, onStartListening]);

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
              paddingRight: 100,
            },
            style,
          ]}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        <View
          style={{
            position: 'absolute',
            right: 12,
            top: 12,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {isListening && isActive && (
            <ThemedText
              style={{
                color: '#ff4757',
                fontSize: 12,
                marginRight: 4,
                fontWeight: '600',
              }}
            >
              {listeningLabel}
            </ThemedText>
          )}
          <TouchableOpacity
            style={[
              styles.micButtonInner,
              {
                backgroundColor:
                  isListening && isActive ? '#ff4757' : colors.tint,
                transform:
                  isListening && isActive ? [{ scale: 1.1 }] : [{ scale: 1 }],
              },
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <IconSymbol
              name='mic.fill'
              size={isListening && isActive ? 20 : 18}
              color='#fff'
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

InputWithMicrophone.displayName = 'InputWithMicrophone';

export default function PromptScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  useEnsureNamespaces('common', 'prompt');
  const { t, i18n } = useTranslation(['common', 'prompt']);

  const [promptName, setPromptName] = useState('');
  const [mainRequest, setMainRequest] = useState('');
  const [role, setRole] = useState('');
  const [context, setContext] = useState('');
  const [exampleStyle, setExampleStyle] = useState('');
  const [responseFormat, setResponseFormat] = useState('');
  const [selectedTone, setSelectedTone] = useState<ToneKey>('neutral');
  const [loading, setLoading] = useState(false);
  const [showTonePicker, setShowTonePicker] = useState(false);

  const toneOptions = useMemo(
    () =>
      TONE_KEYS.map((key) => ({
        key,
        label: getToneLabel(key, t),
      })),
    [t]
  );

  const recognitionLanguage = useMemo(
    () => (i18n.language.startsWith('en') ? 'en-US' : 'fr-FR'),
    [i18n.language]
  );

  const [activeListeningField, setActiveListeningField] = useState<string | null>(
    null
  );
  const [isListening, setIsListening] = useState(false);

  const modalTranslateY = useRef(new Animated.Value(0)).current;
  const activeFieldRef = useRef<string | null>(null);
  const activeCallbackRef = useRef<((text: string) => void) | null>(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    activeFieldRef.current = activeListeningField;
  }, [activeListeningField]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const resetListeningState = useCallback(() => {
    activeFieldRef.current = null;
    activeCallbackRef.current = null;
    setActiveListeningField(null);
  }, []);

  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    resetListeningState();
  });

  useSpeechRecognitionEvent('result', (event) => {
    const callback = activeCallbackRef.current;
    if (callback && event.results && event.results.length > 0) {
      const spokenText = event.results[0]?.transcript || '';
      if (spokenText.trim()) {
        callback(spokenText);
        Alert.alert(
          t('prompt:alerts.recognitionTitle'),
          t('prompt:alerts.recognitionSuccess', { text: spokenText })
        );
      }
    }
    Promise.resolve(ExpoSpeechRecognitionModule.stop()).catch(() => undefined);
    setIsListening(false);
    resetListeningState();
  });

  useSpeechRecognitionEvent('error', (event) => {
    Promise.resolve(ExpoSpeechRecognitionModule.stop()).catch(() => undefined);
    setIsListening(false);
    resetListeningState();
    const normalErrors = ['no-speech', 'no-match', 'aborted'];
    if (!normalErrors.includes(event.error)) {
      Alert.alert(
        t('common.status.error'),
        t('prompt:alerts.recognitionError', { message: event.message })
      );
    }
  });

  useEffect(() => {
    return () => {
      if (isListeningRef.current) {
        Promise.resolve(ExpoSpeechRecognitionModule.stop()).catch(
          () => undefined
        );
      }
    };
  }, []);

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
          closeModalWithAnimation();
        } else {
          Animated.spring(modalTranslateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const closeModalWithAnimation = useCallback(() => {
    Animated.timing(modalTranslateY, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowTonePicker(false);
      modalTranslateY.setValue(0);
    });
  }, [modalTranslateY]);

  const validateForm = () => {
    if (!promptName.trim()) {
      Alert.alert(
        t('common.status.error'),
        t('prompt:alerts.validationName')
      );
      return false;
    }
    if (!mainRequest.trim()) {
      Alert.alert(
        t('common.status.error'),
        t('prompt:alerts.validationMain')
      );
      return false;
    }
    return true;
  };

  const startVoiceRecognition = useCallback(
    async (fieldName: string, callback: (text: string) => void) => {
      try {
        if (isListeningRef.current) {
          await ExpoSpeechRecognitionModule.stop();
          return;
        }

        const permissions =
          await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!permissions.granted) {
          Alert.alert(
            t('prompt:alerts.permissionTitle'),
            t('common.messages.microphonePermission')
          );
          return;
        }

        activeFieldRef.current = fieldName;
        activeCallbackRef.current = callback;
        setActiveListeningField(fieldName);
        setIsListening(true);

        await ExpoSpeechRecognitionModule.start({
          lang: recognitionLanguage,
          interimResults: false,
          continuous: false,
          requiresOnDeviceRecognition: Platform.OS === 'ios',
        });
      } catch (error) {
        console.error('Erreur reconnaissance:', error);
        Alert.alert(
          t('common.status.error'),
          t('prompt:alerts.voiceError')
        );
        setIsListening(false);
        resetListeningState();
      }
    },
    [resetListeningState, recognitionLanguage, t]
  );

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const formData: PromptFormData = {
        promptName,
        mainRequest,
        role,
        context,
        exampleStyle,
        responseFormat,
        selectedTone: getToneLabel(selectedTone, t),
      };

      const savedPrompt = await createPrompt(formData);

      setPromptName('');
      setMainRequest('');
      setRole('');
      setContext('');
      setExampleStyle('');
      setResponseFormat('');
      setSelectedTone('neutral');

      router.push({
        pathname: '/generated' as const,
        params: {
          promptId: savedPrompt.id,
          source: 'form',
        },
      });
    } catch (error) {
      console.error('Erreur création prompt:', error);
      Alert.alert(
        t('common.status.error'),
        t('prompt:alerts.creationError')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScreenHeader title={t('prompt:title')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            {t('prompt:fields.name')}{' '}
            <ThemedText style={{ color: 'red' }}>*</ThemedText>
          </ThemedText>
          <InputWithMicrophone
            value={promptName}
            onChangeText={setPromptName}
            placeholder={t('prompt:placeholders.name')}
            fieldName='promptName'
            onStartListening={startVoiceRecognition}
            isListening={isListening}
            isActive={activeListeningField === 'promptName'}
            listeningLabel={t('common.messages.listening')}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            {t('prompt:fields.mainRequest')}{' '}
            <ThemedText style={{ color: 'red' }}>*</ThemedText>
          </ThemedText>
          <InputWithMicrophone
            value={mainRequest}
            onChangeText={setMainRequest}
            placeholder={t('prompt:placeholders.mainRequest')}
            fieldName='mainRequest'
            multiline
            numberOfLines={4}
            onStartListening={startVoiceRecognition}
            isListening={isListening}
            isActive={activeListeningField === 'mainRequest'}
            listeningLabel={t('common.messages.listening')}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            {t('prompt:fields.role')}
          </ThemedText>
          <InputWithMicrophone
            value={role}
            onChangeText={setRole}
            placeholder={t('prompt:placeholders.role')}
            fieldName='role'
            onStartListening={startVoiceRecognition}
            isListening={isListening}
            isActive={activeListeningField === 'role'}
            listeningLabel={t('common.messages.listening')}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            {t('prompt:fields.context')}
          </ThemedText>
          <InputWithMicrophone
            value={context}
            onChangeText={setContext}
            placeholder={t('prompt:placeholders.context')}
            fieldName='context'
            multiline
            numberOfLines={3}
            onStartListening={startVoiceRecognition}
            isListening={isListening}
            isActive={activeListeningField === 'context'}
            listeningLabel={t('common.messages.listening')}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            {t('prompt:fields.exampleStyle')}
          </ThemedText>
          <InputWithMicrophone
            value={exampleStyle}
            onChangeText={setExampleStyle}
            placeholder={t('prompt:placeholders.exampleStyle')}
            fieldName='exampleStyle'
            multiline
            numberOfLines={3}
            onStartListening={startVoiceRecognition}
            isListening={isListening}
            isActive={activeListeningField === 'exampleStyle'}
            listeningLabel={t('common.messages.listening')}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            {t('prompt:fields.responseFormat')}
          </ThemedText>
          <InputWithMicrophone
            value={responseFormat}
            onChangeText={setResponseFormat}
            placeholder={t('prompt:placeholders.responseFormat')}
            fieldName='responseFormat'
            onStartListening={startVoiceRecognition}
            isListening={isListening}
            isActive={activeListeningField === 'responseFormat'}
            listeningLabel={t('common.messages.listening')}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            {t('prompt:fields.tone')}
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
              {t(`tones.${selectedTone}`)}
            </ThemedText>
            <IconSymbol name='chevron.right' size={16} color={colors.icon} />
          </TouchableOpacity>
        </ThemedView>

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
            {loading
              ? t('prompt:actions.submitting')
              : t('prompt:actions.submit')}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

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
                backgroundColor: colors.card,
                transform: [{ translateY: modalTranslateY }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.modalHandle}>
              <View
                style={[styles.handle, { backgroundColor: colors.icon }]}
              />
            </View>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                {t('prompt:selectTone')}
              </ThemedText>
            </View>
            <FlatList
              data={toneOptions}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.toneItem,
                    {
                      borderColor:
                        selectedTone === item.key
                          ? (colors as any).accent || colors.tint
                          : colors.border,
                      backgroundColor:
                        selectedTone === item.key
                          ? ((colors as any).accent || colors.tint) + '10'
                          : colors.card,
                    },
                  ]}
                  onPress={() => {
                    setSelectedTone(item.key);
                    setShowTonePicker(false);
                  }}
                >
                  {selectedTone === item.key && (
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
                          selectedTone === item.key
                            ? (colors as any).accent || colors.tint
                            : colors.text,
                        fontWeight: selectedTone === item.key ? '600' : '400',
                      },
                    ]}
                  >
                    {item.label}
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
  micButtonInner: {
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




