# Blendwords

A React Native (Expo) app that lets you blend two pieces of text using AI. Enter or speak two texts, pick a mixing mode (style transfer, mashup, debate, or poetry), and get a single blended result. You can also listen to the result via text-to-speech.

## Setup

### Prerequisites

- **Node.js**
- **Yarn**
- **Xcode** (iOS simulator) and/or **Android Studio** (Android emulator). You do **not** need Expo Go; running in a simulator/emulator or a dev build is enough. Reason: Expo Go is a pre-built client with a fixed set of native modules and may not support all plugins or app config (new architecture); simulators and dev builds use the full native project and support the app as intended.

### Install and run

1. **Clone and install dependencies**

   ```bash
   cd blendwords
   yarn install
   ```

2. **Environment variables**

   Copy the example env file and add your API keys:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:
   - `EXPO_PUBLIC_ANTHROPIC_API_KEY` – [Anthropic](https://www.anthropic.com/) API key.
   - `EXPO_PUBLIC_ELEVENLABS_API_KEY` – [ElevenLabs](https://elevenlabs.io/) API key.

3. **Start the dev server**

   ```bash
   yarn start
   ```

   Then:
   ```bash
   npx expo run:ios/npx expo run:android
   ```

## Approach and tradeoffs

### What the app does

- **Flow:** Text 1 (screen 1) → Text 2 (screen 2) → Choose mode (screen 3) → Loading (screen 4) → Result (screen 5). Navigation is linear with React Navigation (native stack). Params pass `text1`, `text2`, and `mode`; screen 5 also receives `result` or `error` from the loading step.
- **Blending:** Claude (Anthropic) is called on screen 4 with a single user message per request. The prompt depends on the selected mode (style transfer, mashup, debate, poetry). Response is parsed for the first text block. A minimum loading duration (e.g. 4s) keeps the loading animation visible before replacing to the result screen; success/error haptics and result sounds (success or error) play when the blend finishes.
- **Result screen (5):** Shows the blended text with the chosen mode badge, a “Listen” button (ElevenLabs TTS via `expo-av`), “Add new” (resets to screen 1), and on error: “Try again” (re-runs blend) and “Choose another mode” (back to screen 3). If screen 5 is reached with `text1`/`text2` but no `result`/`error` (e.g. deep link), it redirects to screen 4 to run the blend.
- **Voice input:** Optional. Recording uses `expo-av`; audio is sent to ElevenLabs Speech-to-Text for transcription. Transcribed text is appended with a character-by-character typing animation (`useVoiceTypingText` hook, ~35ms per character) so voice input feels responsive and readable.

### Technical choices

- **Expo + React Navigation:** Single codebase for iOS/Android with React Navigation native stack and typed route params. No custom native modules for this scope.
- **Theme:** Centralized design tokens (`theme/`: colors, spacing, font sizes, border radius, sizes) and a shared layout component for consistent screens.
- **State:** Local component state and route params only; no global store.
- **Shared Element Transition:** Used for coherent transitions between screens (e.g. from input or loading to result).
- **Animation:** All motion uses **react-native-reanimated**. Animations run on the UI thread for smooth 60fps updates. **Aims:** give clear feedback for user actions, make waits feel shorter and purposeful, and keep transitions between screens coherent. The loading view (`BlendLoadingView`) animates two orbs (text previews) flying into a “mix zone” with a central glow, orbiting particles, and an indeterminate progress ring.

### Tradeoffs

- **No offline or cached blends:** Each blend is a live API call; results aren’t stored. The “Saving Text 1” (or similar) confirmation is a brief animation before navigating with the entered text, not persistence to disk or cloud.
- **Single blend per run:** No history or list of past blends; “Add new” resets to screen 1. Adding history would require local or remote storage and a different navigation model.
