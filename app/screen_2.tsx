import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { BlendTextInput } from '@/components/text-input';
import { Button } from '@/components/button';
import { SharedScreenLayout } from '@/components/shared-screen-layout';
import { StoredConfirmationRow } from '@/components/stored-confirmation-row';
import { ThemedText } from '@/components/themed-text';
import { VoiceInputButton } from '@/components/voice-input-button';

import { ROUTES } from '@/constants/routes';

import {
  LABEL_TEXT,
  useText1PillAnimation,
} from '@/hooks/use-text1-pill-animation';
import { useVoiceInput } from '@/hooks/use-voice-input';

import { Colors } from '@/theme/colors';
import { FontSizes } from '@/theme/font-sizes';
import { Sizes } from '@/theme/sizes';
import { Spacing } from '@/theme/spacing';

import { trim } from '@/utils/trim';

const PREVIEW_MAX_LENGTH = 40;

function truncateForPreview(str: string, max: number = PREVIEW_MAX_LENGTH) {
  const t = trim(str);
  if (t.length <= max) return t;
  return trim(t.slice(0, max)) + '…';
}

export default function Screen2() {
  const router = useRouter();
  const { text1 } = useLocalSearchParams<{ text1?: string }>();
  const [text, setText] = useState('');
  const voice = useVoiceInput();

  const text1Captured = trim(text1).length > 0;
  const previewText = text1 ? truncateForPreview(text1) : '';
  const hasText = trim(text).length > 0;
  const canBlend = text1Captured && hasText;

  const {
    visibleChars,
    text1PillAnimatedStyle,
    text1LabelAnimatedStyle,
    text1PreviewAnimatedStyle,
  } = useText1PillAnimation(text1Captured, previewText.length);

  const handleTranscription = useCallback((transcribed: string) => {
    setText((prev) => (prev ? prev + ' ' + transcribed : transcribed));
  }, []);

  const handleBlend = useCallback(() => {
    if (!canBlend) return;
    router.push({
      pathname: `/${ROUTES.SCREEN_3}`,
      params: { text1: trim(text1!), text2: trim(text) },
    });
  }, [canBlend, router, text, text1]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SharedScreenLayout title="Text 2" onBackPress={handleBack}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          styles.keyboardView,
          text1Captured && styles.keyboardViewWithPill,
        ]}
      >
        {text1Captured && (
          <View style={styles.text1IndicatorWrap} pointerEvents="box-none">
            <Animated.View style={[styles.text1Pill, text1PillAnimatedStyle]}>
              <Animated.Text
                style={[styles.text1Label, text1LabelAnimatedStyle]}
              >
                {LABEL_TEXT.slice(0, visibleChars.label)}
              </Animated.Text>
              <Animated.Text
                numberOfLines={1}
                style={[
                  styles.text1Preview,
                  { color: Colors.text },
                  text1PreviewAnimatedStyle,
                ]}
              >
                {previewText.slice(0, visibleChars.preview)}
              </Animated.Text>
            </Animated.View>
          </View>
        )}

        <ThemedText>
          Type or use voice to enter the second word or phrase.
        </ThemedText>

        <VoiceInputButton
          state={voice.state}
          error={voice.error}
          onStartRecording={voice.startRecording}
          onStopAndTranscribe={voice.stopAndTranscribe}
          onTranscription={handleTranscription}
        />
        <BlendTextInput
          placeholder="Enter your second piece of text..."
          value={text}
          onChangeText={setText}
          multiline
          textAlignVertical="top"
          maxLength={2000}
        />

        {hasText && <StoredConfirmationRow />}

        <Button
          title="Blend"
          onPress={handleBlend}
          disabled={!canBlend}
          style={styles.submitButton}
        />
      </KeyboardAvoidingView>
    </SharedScreenLayout>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    gap: Spacing[12],
  },
  keyboardViewWithPill: {
    paddingTop: Spacing[8],
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
    fontWeight: '600',
  },
  capturedPillPreview: {
    fontWeight: '500',
    maxWidth: Sizes[200],
  },
  text1IndicatorWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  text1Pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[10],
    alignSelf: 'center',
    maxWidth: '100%',
    color: Colors.text,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderTint,
  },
  text1Label: {
    fontSize: FontSizes[14],
    fontWeight: '600',
    color: 'white',
  },
  text1Preview: {
    fontSize: FontSizes[14],
    fontWeight: '500',
    maxWidth: Sizes[200],
  },
  submitButton: {
    marginTop: Spacing[8],
  },
});
