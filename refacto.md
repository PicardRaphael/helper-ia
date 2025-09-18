# Plan de Refactorisation Progressive (Feature-Centric)

Objectif : réduire la taille des composants, extraire la logique hors du rendu et obtenir une architecture modulaire, inspirée des dossiers par fonctionnalité (feature-first) plébiscitée sur des apps React Native de grande taille, tout en conservant des règles SOLID et en évident les couches inutiles.

> Références :
> - Organisation par feature recommandée pour la scalabilité (ExpertBeacon, 2024) – structure claire et encapsulation de la logique.citeturn0search1
> - Domain-based / feature folders pour isoler les fonctionnalités et regrouper composants, services, tests (DEV Community, 2024 ; Sciencx, 2024).citeturn0search5turn0search8
> - Clean layering adapté quand la logique devient complexe ; on reprend ses principes en version légère pour séparer données/UI sans lourdeur.citeturn0search3turn0search6

## Étapes

1. **Créer `src/` et migration initiale**
   - Déplacer le code de `app/`, `components/`, `hooks/`, `services/`, `stores/` vers `src/`.
   - Mettre à jour `tsconfig.json` / `babel` pour que `@/` pointe vers `src`.
   - Aucune refonte logique : uniquement la structure afin de préparer les regroupements.

2. **Structurer par feature**
   - Créer `src/features/prompt`, `src/features/history`, `src/features/settings`, `src/features/common`.
   - Déplacer les écrans + composants + hooks propres à chaque feature dans leur dossier.
   - Placer les composants réellement réutilisables dans `features/common` (ex. `IconSymbol`, `ThemedText`).

3. **Extraire la logique métier/hook par feature**
   - Pour chaque écran :
     - Créer un hook `usePromptForm`, `useHistoryList`, `useSettingsPreferences` qui encapsule appels services, gestion d’état, i18n.
     - Les composants UI reçoivent uniquement props et callbacks.

4. **Isoler la couche données**
   - Créer `src/shared/data/promptRepository.ts` (AsyncStorage) + interface.
   - Adapter les hooks pour consommer l’interface (inversion de dépendance légère). Permettra de remplacer AsyncStorage plus tard sans toucher au rendu.

5. **Modulariser les UI volumineuses**
   - Découper `PromptScreen` en sous-composants (`PromptHeader`, `PromptForm`, `TonePickerModal`, `VoiceInputButton`).
   - Répéter la démarche sur `GeneratedScreen` (`GeneratedHeader`, `GeneratedActionBar`, `PlatformModal`).
   - Veiller à ce qu’aucun fichier ne dépasse ~200 lignes.

6. **Centraliser l’internationalisation**
   - Déplacer les fichiers de traduction dans `src/shared/i18n/{fr,en}/` par feature (`prompt.json`, `history.json`, etc.).
   - Mettre à jour le loader i18n pour enregistrer les namespaces et, si nécessaire, lazy load (optionnel en phase 2).

7. **Normaliser le thème et les composants communs**
   - Créer `src/shared/theme` pour `Colors`, `Fonts`, hooks.
   - S’assurer que tous les composants consomment `useThemeColor` et que la palette ne retourne que des `ColorValue`.

8. **Tests & détection régression**
   - Ajouter au moins un test unitaire par feature (Jest + React Native Testing Library) pour valider les hooks/logiques extraites.
   - Mettre en place un script `npm run test:watch` dans `package.json`.

9. **Nettoyage final et documentation**
   - Supprimer les imports obsolètes, ajouter ESLint `max-lines-per-file` et `max-lines-per-function`.
   - Documenter dans `docs/architecture.md` la structure feature-first, les conventions de nommage et points d’entrée par feature.

> Après chaque étape : lancer `npm run lint`, `npx tsc --noEmit`, puis tests manuels. Une fois validée, only alors passer à l’étape suivante.
