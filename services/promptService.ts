import AsyncStorage from '@react-native-async-storage/async-storage';

import i18n from '@/i18n';
import { getToneLabel, resolveToneKey } from '@/constants/tones';

// Interface pour un prompt sauvegardé
export interface SavedPrompt {
  id: string;
  name: string;
  mainRequest: string;
  role?: string;
  context?: string;
  exampleStyle?: string;
  responseFormat?: string;
  tone: string;
  generatedPrompt: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour les données du formulaire
export interface PromptFormData {
  promptName: string;
  mainRequest: string;
  role: string;
  context: string;
  exampleStyle: string;
  responseFormat: string;
  selectedTone: string;
}

// Interface pour mise à jour d'un prompt
export interface PromptUpdateData {
  promptName?: string;
  mainRequest?: string;
  role?: string;
  context?: string;
  exampleStyle?: string;
  responseFormat?: string;
  selectedTone?: string;
  generatedPrompt?: string;
}

const STORAGE_KEY = '@helper_ia_prompts';

// Génération du prompt formaté selon la structure
export const generateFormattedPrompt = (data: PromptFormData): string => {
  let prompt = '';
  const t = i18n.t.bind(i18n);
  const toneKey = resolveToneKey(data.selectedTone);
  const toneLabel = toneKey ? getToneLabel(toneKey, t) : data.selectedTone;

  if (data.role.trim()) {
    prompt += `${t('promptSections.role')} ${data.role.trim()}\n\n`;
  }

  if (data.context.trim()) {
    prompt += `${t('promptSections.context')} ${data.context.trim()}\n\n`;
  }

  prompt += `${t('promptSections.request')} ${data.mainRequest.trim()}\n\n`;

  if (data.exampleStyle.trim()) {
    prompt += `${t('promptSections.example')} ${data.exampleStyle.trim()}\n\n`;
  }

  if (data.responseFormat.trim()) {
    prompt += `${t('promptSections.format')} ${data.responseFormat.trim()}\n\n`;
  }

  prompt += `${t('promptSections.tone')} ${toneLabel}`;

  return prompt.trim();
};

// Créer un nouveau prompt
export const createPrompt = async (
  data: PromptFormData
): Promise<SavedPrompt> => {
  try {
    const toneKey = resolveToneKey(data.selectedTone);
    const toneLabel = toneKey
      ? getToneLabel(toneKey, i18n.t.bind(i18n))
      : data.selectedTone;
    const normalizedData: PromptFormData = {
      ...data,
      selectedTone: toneLabel,
    };
    const generatedPrompt = generateFormattedPrompt(normalizedData);
    const now = new Date();

    const newPrompt: SavedPrompt = {
      id: Date.now().toString(),
      name: data.promptName.trim(),
      mainRequest: data.mainRequest.trim(),
      role: data.role.trim() || undefined,
      context: data.context.trim() || undefined,
      exampleStyle: data.exampleStyle.trim() || undefined,
      responseFormat: data.responseFormat.trim() || undefined,
      tone: toneLabel,
      generatedPrompt,
      createdAt: now,
      updatedAt: now,
    };

    const existingPrompts = await getAllPrompts();
    const updatedPrompts = [newPrompt, ...existingPrompts];

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrompts));

    return newPrompt;
  } catch (error) {
    console.error('Erreur lors de la création du prompt:', error);
    throw new Error('Impossible de sauvegarder le prompt');
  }
};

// Récupérer tous les prompts
export const getAllPrompts = async (): Promise<SavedPrompt[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const prompts = JSON.parse(data);
    return prompts.map((prompt: any) => ({
      ...prompt,
      createdAt: new Date(prompt.createdAt),
      updatedAt: new Date(prompt.updatedAt),
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des prompts:', error);
    return [];
  }
};

// Récupérer un prompt par ID
export const getPromptById = async (
  id: string
): Promise<SavedPrompt | null> => {
  try {
    const prompts = await getAllPrompts();
    return prompts.find((prompt) => prompt.id === id) || null;
  } catch (error) {
    console.error('Erreur lors de la récupération du prompt:', error);
    return null;
  }
};

// Mettre à jour un prompt
export const updatePrompt = async (
  id: string,
  updates: PromptUpdateData
): Promise<SavedPrompt | null> => {
  try {
    const prompts = await getAllPrompts();
    const promptIndex = prompts.findIndex((prompt) => prompt.id === id);

    if (promptIndex === -1) {
      throw new Error('Prompt non trouvé');
    }

    const existingPrompt = prompts[promptIndex];

    const mergedName = updates.promptName?.trim() ?? existingPrompt.name;
    const mergedMainRequest = updates.mainRequest?.trim() ?? existingPrompt.mainRequest;
    const mergedRoleRaw = updates.role ?? existingPrompt.role ?? '';
    const mergedContextRaw = updates.context ?? existingPrompt.context ?? '';
    const mergedExampleRaw =
      updates.exampleStyle ?? existingPrompt.exampleStyle ?? '';
    const mergedFormatRaw =
      updates.responseFormat ?? existingPrompt.responseFormat ?? '';
    const mergedToneRaw = updates.selectedTone ?? existingPrompt.tone;
    const mergedToneKey = resolveToneKey(mergedToneRaw);
    const toneLabelForPrompt = mergedToneKey
      ? getToneLabel(mergedToneKey, i18n.t.bind(i18n))
      : mergedToneRaw;

    const mergedData: PromptFormData = {
      promptName: mergedName,
      mainRequest: mergedMainRequest,
      role: mergedRoleRaw.trim(),
      context: mergedContextRaw.trim(),
      exampleStyle: mergedExampleRaw.trim(),
      responseFormat: mergedFormatRaw.trim(),
      selectedTone: toneLabelForPrompt,
    };

    const mergedGeneratedPrompt =
      updates.generatedPrompt !== undefined
        ? updates.generatedPrompt.trim()
        : generateFormattedPrompt(mergedData);

    const updatedPrompt: SavedPrompt = {
      ...existingPrompt,
      name: mergedName,
      mainRequest: mergedMainRequest,
      role: mergedData.role || undefined,
      context: mergedData.context || undefined,
      exampleStyle: mergedData.exampleStyle || undefined,
      responseFormat: mergedData.responseFormat || undefined,
      tone: toneLabelForPrompt,
      generatedPrompt: mergedGeneratedPrompt,
      updatedAt: new Date(),
    };

    prompts[promptIndex] = updatedPrompt;

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));

    return updatedPrompt;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du prompt:', error);
    throw error;
  }
};

// Supprimer un prompt
export const deletePrompt = async (id: string): Promise<boolean> => {
  try {
    const prompts = await getAllPrompts();
    const filteredPrompts = prompts.filter((prompt) => prompt.id !== id);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPrompts));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du prompt:', error);
    return false;
  }
};

// Vider tous les prompts (utile pour debugging)
export const clearAllPrompts = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
    return false;
  }
};
