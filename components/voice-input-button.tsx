import { memo, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';

import type { VoiceInputState } from '@/hooks/use-voice-input';

import { Colors } from '@/theme/colors';
import { FontSizes } from '@/theme/font-sizes';
import { Sizes } from '@/theme/sizes';
import { Spacing } from '@/theme/spacing';

type VoiceInputButtonProps = {
  state: VoiceInputState;
  error: string | null;
  onStartRecording: () => Promise<boolean>;
  onStopAndTranscribe: () => Promise<string | null>;
  onTranscription: (text: string) => void;
};

export const VoiceInputButton = memo(function ({
  state,
  error,
  onStartRecording,
  onStopAndTranscribe,
  onTranscription,
}: VoiceInputButtonProps) {
  const handlePress = useCallback(async () => {
    if (state === 'recording') {
      const text = await onStopAndTranscribe();
      if (text) {
        onTranscription(text);
      }
    } else if (state === 'idle') {
      await onStartRecording();
    }
  }, [state, onStartRecording, onStopAndTranscribe, onTranscription]);

  const isDisabled = state === 'transcribing';
  const isRecording = state === 'recording';

  return (
    <View style={styles.wrap}>
      <Button
        variant="outlined"
        disabled={isDisabled}
        onPress={handlePress}
        style={[
          styles.voiceButton,
          {
            backgroundColor: isRecording
              ? Colors.error + '25'
              : Colors.outlineButton + '25',
            borderColor: isRecording ? Colors.error : Colors.outlineButton,
          },
        ]}
      >
        {state === 'transcribing' ? (
          <ActivityIndicator size="small" color={Colors.tint} />
        ) : (
          <MaterialIcons
            name={isRecording ? 'stop' : 'mic'}
            size={Sizes[24]}
            color={isRecording ? Colors.error : Colors.outlineButton}
          />
        )}
        <ThemedText
          type="defaultSemiBold"
          style={[
            styles.label,
            { color: isRecording ? Colors.error : Colors.text },
          ]}
        >
          {state === 'idle' && 'Voice input'}
          {state === 'recording' && 'Tap to stop'}
          {state === 'transcribing' && 'Transcribing…'}
        </ThemedText>
      </Button>
      {error ? (
        <ThemedText
          style={[styles.error, { color: Colors.error }]}
          numberOfLines={2}
        >
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
});
VoiceInputButton.displayName = 'VoiceInputButton';

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing[6],
  },
  voiceButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[10],
    paddingVertical: Spacing[12],
    paddingHorizontal: Spacing[18],
    borderWidth: 1.5,
  },
  label: {
    fontSize: FontSizes[14],
  },
  error: {
    fontSize: FontSizes[13],
  },
});
