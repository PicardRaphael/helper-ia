# Plan de refactorisation des traductions

## Objectif
Réorganiser les ressources i18n afin d'avoir un fichier de traduction par écran/fonctionnalité, tout en conservant un namespace commun pour les textes partagés.

## Étapes prévues
1. **Cartographie des clés existantes**
   - Inspecter `i18n/locales/fr/common.json` et `i18n/locales/en/common.json`.
   - Identifier les blocs par écrans (`prompt`, `history`, `settings`, `generated`, `legal`) et les clés transversales (`common.actions`, `common.status`, etc.).

2. **Nouvelle architecture i18n**
   - Créer les namespaces suivants pour chaque langue :
     - `common.json`
     - `prompt.json`
     - `history.json`
     - `settings.json`
     - `generated.json`
     - `legal.json`
     - `modal.json` (si nécessaire pour les dialogues partagés)
   - Mettre à jour `i18n/resources.ts` avec les loaders correspondants et définir `defaultNamespaces = ['common']`.
   - Déplacer les clés depuis `common.json` vers les nouveaux fichiers en maintenant la structure existante.

3. **Adaptation du code**
   - Mettre à jour les composants pour charger explicitement les namespaces requis via `useEnsureNamespaces()` et `useTranslation()`.
   - Vérifier les usages dans les services/hooks pour pointer vers les nouveaux namespaces.

4. **Validation**
   - Exécuter `npm run lint`.
   - Tester manuellement l’application pour s’assurer que toutes les chaînes se chargent correctement.

## Points d’attention
- Conserver une cohérence de nommage entre FR et EN.
- Documenter la nouvelle structure afin de faciliter l’ajout de futures traductions.
