# Helper IA – Data & Privacy Reference

This document inventories the data flows, storage, permissions, and third-party touchpoints in the Helper IA application. Use it as factual input when drafting a formal privacy policy for EU (GDPR) and US audiences.

## 1. Product Overview
- **Platforms**: Expo/React Native app for Android, iOS, and web (static output).
- **Core features**: create custom AI prompts, save/edit them locally, view prompt history, copy prompts to clipboard, open third-party AI tools (ChatGPT, Gemini, Grok), optional voice dictation for form fields, adjustable theme and language.
- **Accounts & networking**: no authentication, cloud sync, or analytics. All persistence relies on local AsyncStorage.

## 2. Data Inventory
| Data category | Fields captured | Source | Purpose | Storage | Retention | User controls |
|---------------|-----------------|--------|---------|---------|-----------|---------------|
| Prompt metadata & content | `id` (timestamp), `name`, `mainRequest`, optional `role`, `context`, `exampleStyle`, `responseFormat`, `tone` label, generated prompt text, timestamps | Direct user input | Allow users to generate, reuse, and edit prompts | Device-only AsyncStorage key `@helper_ia_prompts` | Persists until user deletes individual prompt or app data | Delete icon in History tab removes a prompt; future policy should mention manual app uninstall to erase all data |
| Prompt drafts (form state) | Current text fields in the prompt form | Direct user input | Provide editing experience before save | Held in component state only; cleared on submit/reset | Lost when navigating away or app restarts | Not stored beyond session |
| Settings preferences | Theme mode, language code | User selection or auto-detected language | Remember UI preferences across sessions | AsyncStorage key `@helper_ia_settings` via Zustand persist | Persists until user changes preference or clears app data | Change toggles in Settings; uninstall removes |
| Speech recognition transcripts | Text returned from OS speech APIs | User voice input (microphone) | Autofill prompt form fields on request | Injected into form state; not automatically saved | Same as drafts—only stored if user saves prompt | User can edit before saving or clear field |
| Clipboard copies | Prompt text | User-triggered copy action | Allow pasting prompt elsewhere | Stored in the OS clipboard managed by Android/iOS | Retained by OS until overwritten or cleared | Users can clear clipboard manually |

## 3. Permissions & Sensitive Features
- **Microphone & speech recognition**: Requested via `expo-speech-recognition` for on-demand voice dictation. On iOS, speech audio may be sent to Apple servers for processing; on Android, Google’s speech services perform recognition. No audio is stored by the app after transcription.
- **Clipboard access**: Uses `expo-clipboard` to write text to the system clipboard when users tap "Copy".

## 4. Third-Party Integrations & Data Flows
- **OS speech services**: Apple Speech framework (iOS) and Google speech services (Android) convert voice to text. Their policies govern any processing of audio.
- **External links**: `Linking.openURL` launches ChatGPT, Gemini, Grok, email client, and app stores. No prompt data is automatically transmitted; users choose when to share content with those third parties.
- **No analytics / advertising SDKs**: The project does not include tracking libraries or ads.

## 5. Security & Storage Notes
- Data stays on-device in AsyncStorage (unencrypted key-value store). Protection relies on the user’s device security (OS sandbox, lock screen).
- No in-app encryption or backup/export features.
- Developers may call `clearAllPrompts()` during debugging, but it is not exposed to end users.

## 6. User Controls & Deletion
- **Prompt deletion**: Users can remove individual prompts from the History tab (calls `deletePrompt`).
- **Reset all data**: Not exposed in UI; users must uninstall the app or clear system storage. Consider documenting this in the final policy.
- **Permission revocation**: Users can disable microphone/speech permissions via OS settings; app should degrade gracefully.

## 7. Regulatory Considerations & Checklist Inputs
- **GDPR (EU)**: Policy should disclose data categories, legal basis (likely consent/legitimate interest for user-requested storage), storage location (device), retention, data subject rights (access, correction, deletion, objection), and contact for the controller. Clarify that user-generated prompts may contain personal data entered at the user’s discretion.
- **CCPA/State laws (US)**: Even without selling data, disclose categories collected, business purpose, and confirm no sale/sharing. Provide contact method and instructions for deletion requests (likely via device controls/uninstall).
- **Children’s data**: App has no age gates; if not intended for children under 13/16, state so explicitly.
- **International transfers**: None by default; note that speech recognition may route through Apple/Google servers in relevant regions.

## 8. Open Points for Legal Draft
1. Determine official data controller contact details (company name, address, email).
2. Decide whether to provide an in-app "clear all data" option to simplify deletion requests.
3. Confirm whether clipboard or prompt content should carry warnings about sensitive data entry.
4. Review Apple/Google speech service terms to describe processing and rely on their lawful basis.
5. Validate if additional consent prompts are needed for voice input in certain jurisdictions.
6. Confirm retention wording (e.g., "until the user deletes the prompt or uninstalls the app").

## 9. Revision Log
- **2025-09-19**: Initial draft capturing current Expo implementation.
