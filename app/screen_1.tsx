import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BlendTextInput } from '@/components/text-input';
import { Button } from '@/components/button';
import { SavingText1Modal } from '@/components/saving-text1-modal';
import { SharedScreenLayout } from '@/components/shared-screen-layout';
import { StoredConfirmationRow } from '@/components/stored-confirmation-row';
import { ThemedText } from '@/components/themed-text';
import { VoiceInputButton } from '@/components/voice-input-button';

import { ROUTES } from '@/constants/routes';

import { useVoiceInput } from '@/hooks/use-voice-input';

import { Sizes } from '@/theme/sizes';
import { Spacing } from '@/theme/spacing';

import { trim } from '@/utils/trim';

export default function Screen1() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [savingModalVisible, setSavingModalVisible] = useState(false);
  const voice = useVoiceInput();

  const hasText = trim(text).length > 0;

  const handleTranscription = useCallback((transcribed: string) => {
    setText((prev) => (prev ? prev + ' ' + transcribed : transcribed));
  }, []);

  const navigateToScreen2 = useCallback(
    (text1Value: string) => {
      router.push({
        pathname: `/${ROUTES.SCREEN_2}`,
        params: { text1: text1Value },
      });
    },
    [router]
  );

  const handleContinue = useCallback(() => {
    if (!hasText) return;
    setSavingModalVisible(true);
  }, [hasText]);

  const handleSavingComplete = useCallback(() => {
    setSavingModalVisible(false);
    navigateToScreen2(trim(text));
  }, [navigateToScreen2, text]);

  return (
    <SharedScreenLayout title="Text 1">
      <View style={styles.wrapper}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ThemedText>
            Type or use voice to enter the first word or phrase.
          </ThemedText>
          <VoiceInputButton
            state={voice.state}
            error={voice.error}
            onStartRecording={voice.startRecording}
            onStopAndTranscribe={voice.stopAndTranscribe}
            onTranscription={handleTranscription}
          />

          <BlendTextInput
            placeholder="Enter your first piece of text..."
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
            maxLength={1000}
          />

          {hasText && <StoredConfirmationRow />}

          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!hasText}
            style={styles.submitButton}
          />
        </KeyboardAvoidingView>
      </View>
      <SavingText1Modal
        visible={savingModalVisible}
        onComplete={handleSavingComplete}
      />
    </SharedScreenLayout>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: Spacing[10],
  },
  keyboardView: {
    flex: 1,
    gap: Spacing[20],
  },
  capturedPillWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[24],
  },
  capturedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[10],
    alignSelf: 'center',
    maxWidth: '100%',
  },
  capturedPillLabel: {
    fontWeight: 600,
  },
  capturedPillPreview: {
    fontWeight: 500,
    maxWidth: Sizes[200],
  },
  submitButton: {
    marginTop: Spacing[8],
  },
});
