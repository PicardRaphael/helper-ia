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
- Les traductions sont chargées en mémoire (non lazy) ; mettre en place un chargement différé pour que chaque écran n'importe que les namespaces dont il a besoin :
  - convertir `i18n/resources.ts` en simple registre de loaders dynamiques (`const translationLoaders = { fr: () => import('./locales/fr/common.json'), ... }`) et supprimer l'import direct des JSON dans le bundle initial ;
  - initialiser `i18n` sans `resources` statiques, ajouter un helper `ensureNamespacesLoaded(namespaces)` qui fait `await Promise.all(namespaces.map((ns) => translationLoaders[lng]?.().then((module) => i18n.addResources(lng, ns, module.default))))` avant d'afficher l'écran ;
  - dans le layout racine (`app/_layout.tsx`), attendre `ensureNamespacesLoaded(['common'])` via le splash Expo pour éviter le clignotement, et déclencher les autres `ensureNamespacesLoaded` dans le `useEffect` de chaque écran lorsque l'utilisateur arrive sur l'onglet concerné ;
  - activer `useSuspense: false` dans `useTranslation` tant que la promesse est manuelle, puis mesurer le bundle Android/iOS pour s'assurer que la baisse est effective.
