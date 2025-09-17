import AsyncStorage from '@react-native-async-storage/async-storage';

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

const STORAGE_KEY = '@helper_ia_prompts';

// Génération du prompt formaté selon la structure
export const generateFormattedPrompt = (data: PromptFormData): string => {
  let prompt = '';

  // Ajouter le rôle si présent
  if (data.role.trim()) {
    prompt += `**Rôle :** ${data.role.trim()}\n\n`;
  }

  // Ajouter le contexte si présent
  if (data.context.trim()) {
    prompt += `**Contexte :** ${data.context.trim()}\n\n`;
  }

  // Ajouter la demande principale (obligatoire)
  prompt += `**Demande :** ${data.mainRequest.trim()}\n\n`;

  // Ajouter l'exemple/style si présent
  if (data.exampleStyle.trim()) {
    prompt += `**Exemple/Style :** ${data.exampleStyle.trim()}\n\n`;
  }

  // Ajouter le format de réponse si présent
  if (data.responseFormat.trim()) {
    prompt += `**Format souhaité :** ${data.responseFormat.trim()}\n\n`;
  }

  // Ajouter le ton
  prompt += `**Ton :** ${data.selectedTone}`;

  return prompt.trim();
};

// Créer un nouveau prompt
export const createPrompt = async (
  data: PromptFormData
): Promise<SavedPrompt> => {
  try {
    const generatedPrompt = generateFormattedPrompt(data);
    const now = new Date();

    const newPrompt: SavedPrompt = {
      id: Date.now().toString(), // Simple ID basé sur timestamp
      name: data.promptName.trim(),
      mainRequest: data.mainRequest.trim(),
      role: data.role.trim() || undefined,
      context: data.context.trim() || undefined,
      exampleStyle: data.exampleStyle.trim() || undefined,
      responseFormat: data.responseFormat.trim() || undefined,
      tone: data.selectedTone,
      generatedPrompt,
      createdAt: now,
      updatedAt: now,
    };

    // Récupérer les prompts existants
    const existingPrompts = await getAllPrompts();

    // Ajouter le nouveau prompt au début de la liste
    const updatedPrompts = [newPrompt, ...existingPrompts];

    // Sauvegarder
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
    // Convertir les dates string en Date objects
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
  updates: Partial<PromptFormData>
): Promise<SavedPrompt | null> => {
  try {
    const prompts = await getAllPrompts();
    const promptIndex = prompts.findIndex((prompt) => prompt.id === id);

    if (promptIndex === -1) {
      throw new Error('Prompt non trouvé');
    }

    const existingPrompt = prompts[promptIndex];

    // Fusionner les mises à jour
    const updatedData: PromptFormData = {
      promptName: updates.promptName || existingPrompt.name,
      mainRequest: updates.mainRequest || existingPrompt.mainRequest,
      role: updates.role || existingPrompt.role || '',
      context: updates.context || existingPrompt.context || '',
      exampleStyle: updates.exampleStyle || existingPrompt.exampleStyle || '',
      responseFormat:
        updates.responseFormat || existingPrompt.responseFormat || '',
      selectedTone: updates.selectedTone || existingPrompt.tone,
    };

    // Regénérer le prompt formaté
    const generatedPrompt = generateFormattedPrompt(updatedData);

    // Mettre à jour le prompt
    const updatedPrompt: SavedPrompt = {
      ...existingPrompt,
      name: updatedData.promptName,
      mainRequest: updatedData.mainRequest,
      role: updatedData.role || undefined,
      context: updatedData.context || undefined,
      exampleStyle: updatedData.exampleStyle || undefined,
      responseFormat: updatedData.responseFormat || undefined,
      tone: updatedData.selectedTone,
      generatedPrompt,
      updatedAt: new Date(),
    };

    prompts[promptIndex] = updatedPrompt;

    // Sauvegarder
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
