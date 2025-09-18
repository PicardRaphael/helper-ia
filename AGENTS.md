# Repository Guidelines

## Project Structure & Module Organization
- `app/` implements Expo Router; tabs sit in `app/(tabs)/` with `_layout.tsx`, `index.tsx` captures prompt input, `generated.tsx` renders results, and `modal.tsx` hosts shared dialogs. Add screens within `app/` and wire navigation according to `project.md`.
- Reusable UI lives in `components/` (`themed-*`, `ui/`); keep feature-only pieces beside their screen until reused.
- Theme helpers stay in `hooks/`, and persistence logic in `services/promptService.ts` to keep AsyncStorage behaviour aligned with Phase 2.
- Styling tokens span `constants/theme.ts`, `tailwind.config.js`, and `global.css`; adjust them together when branding shifts.

## Build, Test, and Development Commands
- `npm install` bootstraps dependencies.
- `npm run start` (`npx expo start`) launches Metro; press `a`, `i`, or `w` to open Android, iOS, or web.
- `npm run android`, `npm run ios`, `npm run web` produce platform builds for device checks.
- `npm run lint` runs the Expo ESLint preset; resolve warnings before pushing.
- `npm run reset-project` archives the current app into `app-example/` and seeds a blank scaffold—use sparingly.

## Coding Style & Naming Conventions
- TypeScript everywhere; keep shared interfaces explicit and colocate screen-specific types.
- Follow the Expo lint rules (2-space indent, single quotes, trailing semicolons). Prefer NativeWind `className` utilities over inline styles when tokens exist.
- Name screens in PascalCase (`PromptScreen.tsx`), hooks in camelCase (`usePromptHistory.ts`), and future stores as `feature.store.ts`.

## Testing Guidelines
- Automated tests are pending; when adding them, use `jest-expo` with `@testing-library/react-native` and mirror the route tree under `__tests__/`.
- Until automation lands, follow the checklists in `project.md`: validate prompt creation, history persistence, and settings on both a simulator and a physical device. Before merging, run `npm run lint`, reload via Expo Go, ensure AsyncStorage survives an app restart, and document the manual steps in the PR.

## Commit & Pull Request Guidelines
- Write short, imperative commits (`Add speech modal flow`), one concern per commit; note navigation or storage changes in the body.
- Reference the relevant Phase/Étape from `project.md`, attach device screenshots or recordings for UI changes, list manual test results, and flag follow-up tasks before requesting review.

## Security & Configuration Tips
- Store EmailJS and other secrets in Expo config or EAS secrets—never in source control; review `eas.json` before remote builds.
- AsyncStorage keeps user prompts, so avoid verbose logging in production and call `clearAllPrompts()` when debugging sensitive data.
- Keep branding assets (`assets/`, `app.json`, `android/`) aligned so release steps stay reproducible.
