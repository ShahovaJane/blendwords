import { useCallback, useEffect, useRef, useState } from 'react';

const TYPING_INTERVAL_MS = 35;

export function useVoiceTypingText(initialText = '') {
  const [text, setTextState] = useState(initialText);
  const [displayedText, setDisplayedText] = useState(initialText);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetRef = useRef('');
  const indexRef = useRef(0);

  const cancelTyping = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => cancelTyping(), [cancelTyping]);

  const appendFromVoice = useCallback(
    (transcribed: string) => {
      cancelTyping();
      setTextState((prev) => {
        const target = prev ? prev + ' ' + transcribed : transcribed;
        targetRef.current = target;
        indexRef.current = prev.length;
        intervalRef.current = setInterval(() => {
          indexRef.current += 1;
          const next = targetRef.current.slice(0, indexRef.current);
          setDisplayedText(next);
          if (indexRef.current >= targetRef.current.length) {
            if (intervalRef.current !== null) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setTextState(targetRef.current);
          }
        }, TYPING_INTERVAL_MS);
        return prev;
      });
    },
    [cancelTyping]
  );

  const onChangeText = useCallback(
    (newValue: string) => {
      cancelTyping();
      setTextState(newValue);
      setDisplayedText(newValue);
    },
    [cancelTyping]
  );

  const setText = useCallback(
    (value: string) => {
      cancelTyping();
      setTextState(value);
      setDisplayedText(value);
    },
    [cancelTyping]
  );

  return {
    value: displayedText,
    text,
    setText,
    onChangeText,
    appendFromVoice,
  };
}
