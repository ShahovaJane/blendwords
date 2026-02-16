import { Audio } from 'expo-av';

const successSource = require('@/assets/sounds/success.mp3');
const errorSource = require('@/assets/sounds/error.mp3');

async function ensureAudioMode() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

export async function playResultSound(
  type: 'success' | 'error'
): Promise<void> {
  try {
    await ensureAudioMode();
    const source = type === 'success' ? successSource : errorSource;
    const { sound } = await Audio.Sound.createAsync(source, {
      shouldPlay: true,
    });
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch {}
}
