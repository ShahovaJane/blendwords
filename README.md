# Blendwords

A React Native (Expo) app that lets you blend two pieces of text using AI. Enter or speak two texts, pick a mixing mode (style transfer, mashup, debate, or poetry), and get a single blended result. You can also listen to the result via text-to-speech.

## Setup

### Prerequisites

- **Node.js**
- **Yarn**
- **Expo Go** on your device (for quick testing), or Xcode / Android Studio for simulators or dev builds

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
   - Scan the QR code with Expo Go (Android) or the Camera app (iOS), or
   - Press `i` for iOS simulator or `a` for Android emulator.

## Approach and tradeoffs

### What the app does

- **Flow:** Text 1 (screen 1) → Text 2 (screen 2) → Choose mode (screen 3) → Blend result (screen 4). Navigation is linear with expo-router stack; params pass `text1` and `text2` between screens.
- **Blending:** Claude (Anthropic) is called with a single user message per request. The prompt depends on the selected mode (style transfer, mashup, debate, poetry). Response is parsed for the first text block and shown as the result.
- **Voice:** Optional. Recording uses `expo-av`; audio is sent to ElevenLabs Speech-to-Text for transcription. On the result screen, “Listen” uses ElevenLabs TTS; the audio is fetched, written to the app cache, and played with `expo-av`.

### Technical choices

- **Expo + expo-router:** Single codebase for iOS/Android with file-based routing and typed routes. No custom native modules for this scope.
- **Theme:** Centralized design tokens (`theme/`: colors, spacing, font sizes, border radius, sizes) and a shared layout component for consistent screens.
- **State:** Local component state and route params only; no global store.
- **Animation:** All motion uses **react-native-reanimated**. Animations run on the UI thread for smooth 60fps updates. **Aims:** give clear feedback for user actions, make waits feel shorter and purposeful, and keep transitions between screens coherent.

### Tradeoffs

- **No offline or cached blends:** Each blend is a live API call; results aren’t stored. The “Saving Text 1” modal is a brief confirmation animation before navigating with the entered text, not persistence to disk or cloud.
- **Single blend per run:** No history or list of past blends; “Add new” resets to screen 1. Adding history would require local or remote storage and a different navigation model.
