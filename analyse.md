# Analyse de l'application Helper IA

## Points positifs

- `services/promptService.ts:44-211` couvre désormais tout le cycle de vie des prompts, accepte des mises à jour partielles (y compris `generatedPrompt`) et génère le format final avec l'i18n actif.
- `app/(tabs)/prompt.tsx:200-389` simplifie la logique de reconnaissance vocale avec des `ref` locaux, internationalise tous les libellés/alertes et fournit les traductions de tons via les clés communes.
- `app/generated.tsx:138-360` persiste réellement le texte édité, trace les erreurs critiques, s'appuie sur `react-i18next` pour l'ensemble des actions (copie, sauvegarde, ouvertures) et respecte l'origine de navigation (`source`).
- `app/(tabs)/historique.tsx:25-219` corrige le pluriel du compteur, transporte le paramètre `source='history'`, formate les dates selon la langue active et traduit les confirmations.
- `app/(tabs)/parametres.tsx:1-205`, `stores/settingsStore.ts:1-37` et `i18n/index.ts` introduisent un store persistant pour les thèmes/langues, branchent `react-i18next`, exposent des liens de contact/mentions légales réels et alignent les options UI.
- `constants/theme.ts:8-53` limite les clés accessibles via `useThemeColor` aux valeurs réellement colorimétriques, ce qui fait repasser `npx tsc --noEmit`.

## Points à corriger en priorité

- Les prompts déjà enregistrés conservent la valeur de ton d'origine ; le mapping `resolveToneKey` couvre FR/EN mais une migration côté stockage serait nécessaire si d'autres langues sont ajoutées.
- Les traductions sont chargées en mémoire (non lazy) ; à surveiller si d'autres langues ou namespaces sont introduits (chargement différé conseillé pour limiter le bundle).
