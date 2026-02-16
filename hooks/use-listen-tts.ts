import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

import { LISTEN_STATE, type ListenState } from '@/constants/listen-state';

import { textToSpeech } from '@/services/elevenlabs';

import { trim } from '@/utils/trim';

export function useListenTTS(text: string | null) {
  const [listenState, setListenState] = useState<ListenState>(
    LISTEN_STATE.IDLE
  );
  const [listenError, setListenError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      const sound = soundRef.current;
      if (sound) {
        sound.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  const handleListen = useCallback(async () => {
    const trimmed = trim(text);
    if (!trimmed || listenState === LISTEN_STATE.LOADING) return;

    const previous = soundRef.current;
    if (previous) {
      try {
        await previous.unloadAsync();
      } catch {}
      soundRef.current = null;
    }

    setListenError(null);
    setListenState(LISTEN_STATE.LOADING);
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const uri = await textToSpeech(trimmed);
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setListenState(LISTEN_STATE.PLAYING);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setListenState(LISTEN_STATE.IDLE);
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      });
    } catch (e) {
      setListenError(e instanceof Error ? e.message : 'Playback failed.');
      setListenState(LISTEN_STATE.IDLE);
    }
  }, [text, listenState]);

  const handleStop = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;
    try {
      await sound.stopAsync();
      await sound.unloadAsync();
    } catch {}
    soundRef.current = null;
    setListenState(LISTEN_STATE.IDLE);
  }, []);

  const reset = useCallback(() => {
    setListenError(null);
    setListenState(LISTEN_STATE.IDLE);
  }, []);

  return {
    handleListen,
    handleStop,
    listenState,
    setListenState,
    listenError,
    reset,
  };
}
