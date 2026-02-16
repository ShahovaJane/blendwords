import { useCallback, useRef, useState } from 'react';
import { Audio } from 'expo-av';

import { transcribe } from '@/services/elevenlabs';

export type VoiceInputState = 'idle' | 'recording' | 'transcribing';

export function useVoiceInput() {
  const [state, setState] = useState<VoiceInputState>('idle');
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      setError('Microphone permission is required for voice input.');
      return false;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    return true;
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    setError(null);
    const ok = await requestPermissions();
    if (!ok) return false;

    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setState('recording');
      return true;
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Failed to start recording';
      setError(message);
      return false;
    }
  }, [requestPermissions]);

  const stopAndTranscribe = useCallback(async (): Promise<string | null> => {
    const recording = recordingRef.current;
    if (!recording) {
      setState('idle');
      return null;
    }

    try {
      await recording.stopAndUnloadAsync();
      recordingRef.current = null;
      const uri = recording.getURI();
      if (!uri) {
        setError('No recording file.');
        setState('idle');
        return null;
      }

      setState('transcribing');
      const result = await transcribe(uri);
      setState('idle');
      return result.text || null;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Transcription failed';
      setError(message);
      setState('idle');
      return null;
    }
  }, []);

  const cancelRecording = useCallback(async () => {
    const recording = recordingRef.current;
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch {
        // ignore
      }
      recordingRef.current = null;
    }
    setState('idle');
    setError(null);
  }, []);

  return {
    state,
    error,
    startRecording,
    stopAndTranscribe,
    cancelRecording,
  };
}
