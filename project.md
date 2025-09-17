# Workflow de Développement - App Générateur de Prompts

## 🚀 Stack Technique

- **Framework** : Expo React Native
- **Navigation** : React Navigation v6 + Bottom Tabs
- **Styling** : NativeWind (Tailwind CSS pour React Native)
- **State Management** : React State + Zustand (si nécessaire)
- **Stockage Local** : AsyncStorage
- **Icons** : React Native Vector Icons
- **Email** : EmailJS (gratuit)
- **Animations** : React Native Reanimated (optionnel)

---

## 📋 Phase 1 : Configuration initiale

### Étape 1.2 : Installation des dépendances principales

```bash
# Styling
npm install nativewind
npm install --dev tailwindcss

# Storage & Utils
npx expo install @react-native-async-storage/async-storage
npm install react-native-vector-icons
npm install zustand

# Email
npm install @emailjs/react-native
```

**Actions :**

- Configurer Tailwind CSS avec NativeWind
- Créer `tailwind.config.js`
- Tester qu'une classe Tailwind fonctionne

**✅ Test requis** : Afficher un texte avec `className="text-blue-500 text-xl"` avant de continuer

---

### Étape 1.3 : Configuration de la navigation

**Actions :**

- Configurer React Navigation avec à partir de app/(tabs)/\_layout.tsx
- Créer 3 onglets : Prompt, Historique, Paramètres
- Ajouter les icons appropriés

**✅ Test requis** : Navigation fonctionnelle entre les 3 onglets + tester sur device physique

---

## 📱 Phase 2 : Écrans de base

### Étape 2.1 : Écran Prompt (formulaire)

**Actions :**

- Créer le formulaire avec tous les champs :
  - Nom du prompt (TextInput obligatoire)
  - Demande principale (TextArea obligatoire)
  - Rôle (TextInput optionnel)
  - Contexte (TextArea optionnel)
  - Exemple/style (TextArea optionnel)
  - Format de réponse (TextInput optionnel)
  - Ton (Picker avec la liste fournie)
- Validation basique des champs obligatoires
- Bouton "Envoyer" avec état de chargement

**Liste des tons à intégrer :**

```javascript
const TONES = [
  'Neutre / factuel',
  'Professionnel / corporate',
  'No-bullshit / direct',
  'Assertif',
  'Technique – niveau expert',
  'Technique – pédagogique',
  // ... (liste complète fournie)
];
```

**✅ Test requis** :

- Valider les champs obligatoires
- Tester le picker de tons
- Vérifier l'UX sur différentes tailles d'écran
- **RE-TESTER** la navigation entre onglets

---

### Étape 2.2 : Sauvegarde locale et génération du prompt

**Actions :**

- Créer les fonctions AsyncStorage pour CRUD des prompts
- Implémenter la logique de génération du prompt formaté
- Créer la fonction de sauvegarde après "Envoyer"
- Navigation vers l'écran "Prompt généré"

**✅ Test requis** :

- Créer un prompt, vérifier la sauvegarde
- Vérifier que les données persistent après fermeture/réouverture
- **RE-TESTER** l'étape 2.1 (formulaire)

---

### Étape 2.3 : Écran "Prompt généré"

**Actions :**

- Input nom modifiable
- TextArea prompt éditable
- Bouton "Enregistrer" conditionnel (visible si modifications)
- Bouton "Copier" avec feedback utilisateur
- Picker : ChatGPT, Gemini, Grok
- Bouton "Aller vers" avec ouverture d'apps/web
- Gestion du bouton retour intelligent

**✅ Test requis** :

- Tester l'édition et la sauvegarde
- Vérifier la copie dans le presse-papiers
- Tester l'ouverture des apps IA
- Vérifier la logique de retour (formulaire vs historique)
- **RE-TESTER** l'étape 2.2 (sauvegarde)

---

## 📚 Phase 3 : Historique et paramètres

### Étape 3.1 : Écran Historique

**Actions :**

- Liste des prompts sauvegardés
- Affichage nom + aperçu tronqué
- Navigation vers "Prompt généré" au clic
- Gestion des états vides
- Pull-to-refresh optionnel

**✅ Test requis** :

- Créer plusieurs prompts depuis le formulaire
- Vérifier l'affichage dans l'historique
- Tester l'ouverture d'un prompt depuis l'historique
- **RE-TESTER** l'étape 2.3 (écran prompt généré)

---

### Étape 3.2 : Écran Paramètres - Structure de base

**Actions :**

- Layout de l'écran paramètres
- Sections : Langue, Thème, Évaluation, Contact, Légales
- Navigation vers les sous-écrans

**✅ Test requis** :

- Vérifier le layout sur différents devices
- Tester la navigation vers chaque sous-section
- **RE-TESTER** l'étape 3.1 (historique)

---

### Étape 3.3 : Gestion des langues

**Actions :**

- Détection langue système
- Choix Français/Anglais
- Sauvegarde préférence utilisateur
- Application de la langue dans l'app

**✅ Test requis** :

- Tester changement de langue
- Vérifier persistence après redémarrage
- **RE-TESTER** l'étape 3.2 (navigation paramètres)

---

### Étape 3.4 : Système de thèmes

**Actions :**

- Thème clair/sombre/système
- Modal bottom sheet pour sélection
- Bouton lune/soleil en header
- Sauvegarde préférence
- Application du thème dans toute l'app

**✅ Test requis** :

- Tester les 3 modes de thème
- Vérifier que tous les écrans s'adaptent
- Tester le bouton lune/soleil
- **RE-TESTER** l'étape 3.3 (langues)

---

## 🚀 Phase 4 : Fonctionnalités avancées

### Étape 4.1 : Configuration EmailJS

**Actions :**

- Créer compte EmailJS gratuit
- Configurer service email
- Créer templates pour contact et admin
- Intégrer dans l'app React Native

**✅ Test requis** :

- Envoyer un email de test depuis l'app
- Vérifier réception
- **RE-TESTER** l'étape 3.4 (thèmes)

---

### Étape 4.2 : Formulaire de contact

**Actions :**

- Formulaire nom/email/message
- Validation des champs
- Envoi via EmailJS
- Feedback utilisateur (succès/erreur)
- États de chargement

**✅ Test requis** :

- Tester envoi email avec données valides/invalides
- Vérifier les messages de feedback
- **RE-TESTER** l'étape 4.1 (EmailJS)

---

### Étape 4.3 : Pages légales (Privacy Policy & À propos)

**Actions :**

- Créer les écrans avec contenu fourni
- Scroll view pour longs textes
- Boutons retour appropriés
- Mise en forme lisible

**✅ Test requis** :

- Vérifier lisibilité sur mobile
- Tester navigation retour
- **RE-TESTER** l'étape 4.2 (contact)

---

### Étape 4.4 : Évaluation app (lien vers stores)

**Actions :**

- Détection plateforme (iOS/Android)
- Ouverture du store approprié
- Gestion cas d'erreur si store indisponible

**✅ Test requis** :

- Tester sur iOS et Android
- Vérifier ouverture correcte des stores
- **RE-TESTER** l'étape 4.3 (pages légales)

---

## 💰 Phase 5 : Gestion question payante

### Étape 5.1 : Logique d'affichage de la popup

**Actions :**

- Vérifier si historique vide (première ouverture)
- Détecter quand utilisateur a ≥1 prompt
- Afficher popup modale une seule fois
- Stocker choix utilisateur localement

**✅ Test requis** :

- Première ouverture : pas de popup
- Après création 1er prompt : popup s'affiche
- Choix stocké : popup ne se réaffiche plus
- **RE-TESTER** l'étape 4.4 (évaluation)

---

### Étape 5.2 : Modal et envoi email admin

**Actions :**

- Design modal attractive "Prêt à payer pour améliorations IA ?"
- Boutons Oui/Non
- Envoi automatique email admin avec choix
- Processus invisible pour utilisateur
- Gestion erreurs d'envoi

**✅ Test requis** :

- Tester choix "Oui" et "Non"
- Vérifier réception emails admin
- Confirmer invisibilité du processus
- **RE-TESTER** l'étape 5.1 (logique popup)

---

## 🎨 Phase 6 : Polish et optimisations

### Étape 6.1 : Design system et cohérence visuelle

**Actions :**

- Définir palette de couleurs attractive
- Standardiser espacements et typographie
- Harmoniser boutons et composants
- Micro-animations si souhaité

**✅ Test requis** :

- Review UX sur tous les écrans
- Tester transitions et animations
- Vérifier cohérence visuelle
- **RE-TESTER** l'étape 5.2 (modal payante)

---

### Étape 6.2 : Optimisations performance

**Actions :**

- Optimiser re-renders avec useCallback/useMemo
- Lazy loading si applicable
- Optimisation AsyncStorage (batch operations)
- Test performance sur devices bas de gamme

**✅ Test requis** :

- Tester sur device Android bas de gamme
- Vérifier fluidité navigation
- Chronométrer temps de chargement
- **RE-TESTER** l'étape 6.1 (design)

---

### Étape 6.3 : Tests utilisateur et debugging

**Actions :**

- Test complet user journey
- Vérification gestion erreurs
- Test offline/online
- Debug crashs potentiels

**✅ Test requis** :

- Parcours complet : création → historique → paramètres
- Test mode avion
- Test avec données corrompues
- **RE-TESTER** l'étape 6.2 (performance)

---

## 📦 Phase 7 : Préparation publication

### Étape 7.1 : Configuration Expo/EAS

**Actions :**

- Configuration app.json/app.config.js
- Icons et splash screen
- Permissions appropriées
- Configuration EAS Build

**✅ Test requis** :

- Build local réussi
- Test sur devices physiques
- **RE-TESTER** l'étape 6.3 (tests utilisateur)

---

### Étape 7.2 : Builds et publication

**Actions :**

- Build production iOS/Android
- Test builds production
- Soumission stores (App Store Connect + Google Play Console)
- Métadonnées stores (descriptions, screenshots)

**✅ Test requis** :

- Installation depuis build production
- Test toutes fonctionnalités en prod
- **RE-TESTER** l'étape 7.1 (configuration)

---

## ⚡ Règles importantes

### 🔄 Règle de test systématique

- **JAMAIS** passer à l'étape suivante sans avoir testé l'étape actuelle
- Après chaque étape : tester l'étape suivante ET re-tester l'étape précédente
- Tester sur device physique ET simulateur

### 🐛 Gestion des bugs

- Si bug détecté : corriger avant de continuer
- Re-tester après chaque correction
- Documenter les bugs récurrents

### 💾 Sauvegarde du progrès

- Commit Git après chaque étape validée
- Messages de commit descriptifs
- Branches features pour grosses modifications

---

## 📱 Checklist finale avant publication

- [ ] Tous les écrans responsive
- [ ] Navigation fluide et intuitive
- [ ] Sauvegarde/chargement données fiable
- [ ] Emails fonctionnels (contact + admin)
- [ ] Thèmes clair/sombre complets
- [ ] Langues FR/EN opérationnelles
- [ ] Modal payante testée
- [ ] Performance optimisée
- [ ] Icons et design finalisés
- [ ] Builds production validés

---

## 🎯 Points d'attention spécifiques

1. **Gestion retour intelligent** : Bien distinguer retour depuis formulaire vs historique
2. **Confidentialité** : Toutes les données restent locales (sauf emails)
3. **UX fluide** : Transitions smooth entre écrans
4. **Modal payante** : Une seule apparition, envoi invisible
5. **Robustesse** : Gestion erreurs et cas limites

**Temps estimé total** : 3-4 semaines pour un développeur expérimenté
