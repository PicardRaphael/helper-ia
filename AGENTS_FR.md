# Guide du dépôt

## Structure du projet et organisation
- `app/` orchestre Expo Router : onglets et layouts dans `app/(tabs)/`, saisie dans `index.tsx`, restitution dans `generated.tsx`, dialogues communs dans `modal.tsx`. Ajoute toute nouvelle route dans `app/` en suivant la progression définie dans `project.md`.
- `components/` accueille les briques réutilisables (`themed-*`, `ui/`), `hooks/` conserve les helpers de thème et `services/promptService.ts` centralise AsyncStorage pour la Phase 2. Mets simultanément à jour `constants/theme.ts`, `tailwind.config.js` et `global.css` lorsque la charte évolue.

## Commandes de build, tests et développement
- `npm install` installe les dépendances locales.
- `npm run start` (`npx expo start`) lance Metro ; tape `a`, `i` ou `w` pour cibler Android, iOS ou web.
- `npm run android`, `npm run ios`, `npm run web` produisent les builds requis pour les validations de la Phase 7.
- `npm run lint` applique la configuration ESLint Expo, et `npm run reset-project` archive l’app courante dans `app-example/` avant de recréer un squelette propre.

## Style de code et conventions
- TypeScript obligatoire ; garde les types partagés documentés et proches des écrans qui les exploitent.
- Respecte la configuration ESLint (indentation 2 espaces, guillemets simples, points-virgules) et préfère les classes NativeWind via `className` plutôt que des styles inline.
- Nommes les écrans en PascalCase (`PromptScreen.tsx`), les hooks en camelCase (`usePromptHistory.ts`) et les stores futurs en `feature.store.ts`.

## Directives de test
- Les tests automatisés arriveront via `jest-expo` et `@testing-library/react-native`, rangés dans `__tests__/` en miroir des routes.
- D’ici là, suis les checklists de `project.md` : création de prompt, historique persistant et paramètres vérifiés sur appareil physique et simulateur.
- Avant chaque merge : exécute `npm run lint`, recharge avec Expo Go, valide la persistance AsyncStorage après redémarrage et consigne les pas manuels dans la PR.

## Commits et Pull Requests
- Rédige des commits impératifs et concis (`Ajouter le flux modal vocal`), un sujet par changement, en explicitant navigation ou stockage quand c’est pertinent.
- Chaque PR cite la Phase/Étape concernée, joint captures ou vidéos pour les changements UI et résume les vérifications réalisées.

## Sécurité et configuration
- Gère EmailJS et autres secrets via la config Expo ou les secrets EAS ; vérifie `eas.json` avant tout build distant.
- L’AsyncStorage stocke des prompts utilisateurs : limite les logs sensibles et utilise `clearAllPrompts()` pour les sessions de débogage.
- Synchronise `assets/`, `app.json` et `android/` afin de conserver des livraisons reproductibles.
