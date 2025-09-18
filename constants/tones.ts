export const TONE_KEYS = [
  'neutral',
  'corporate',
  'direct',
  'assertive',
  'technicalExpert',
  'technicalPedagogic',
  'friendly',
  'enthusiastic',
  'creative',
  'humorous',
  'empathetic',
  'authoritative',
  'persuasive',
  'educational',
  'storytelling',
] as const;

export type ToneKey = (typeof TONE_KEYS)[number];

const LEGACY_LABELS: Record<ToneKey, string[]> = {
  neutral: ['Neutre / factuel', 'Neutral / factual'],
  corporate: ['Professionnel / corporate', 'Professional / corporate'],
  direct: ['No-bullshit / direct'],
  assertive: ['Assertif', 'Assertive'],
  technicalExpert: ['Technique – niveau expert', 'Technical - expert level'],
  technicalPedagogic: ['Technique – pédagogique', 'Technical - educational'],
  friendly: ['Amical / décontracté', 'Friendly / casual'],
  enthusiastic: ['Enthousiaste / motivant', 'Enthusiastic / motivating'],
  creative: ['Créatif / inspirant', 'Creative / inspiring'],
  humorous: ['Humoristique / léger', 'Humorous / light'],
  empathetic: ['Empathique / bienveillant', 'Empathetic / caring'],
  authoritative: ['Autorité / expert', 'Authority / expert'],
  persuasive: ['Vendeur / persuasif', 'Sales / persuasive'],
  educational: ['Éducatif / informatif', 'Educational / informative'],
  storytelling: ['Storytelling / narratif', 'Storytelling / narrative'],
};

export const resolveToneKey = (value: string | undefined | null): ToneKey | null => {
  if (!value) return null;
  const normalized = value.trim();
  for (const key of TONE_KEYS) {
    if (normalized === key) {
      return key;
    }
    if (LEGACY_LABELS[key].some((label) => label === normalized)) {
      return key;
    }
  }
  return null;
};

export const getToneLabel = <T extends (key: string, options?: any) => string>(
  key: ToneKey,
  t: T
) => t(`tones.${key}`);

export const toneLegacyLabels = LEGACY_LABELS;
