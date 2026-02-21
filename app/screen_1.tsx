import { useCallback, useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { stylesInput } from '@/components/text-input';
import { Button } from '@/components/button';
import { SharedScreenLayout } from '@/components/shared-screen-layout';
import { StoredConfirmationRow } from '@/components/stored-confirmation-row';
import { ThemedText } from '@/components/themed-text';
import { VoiceInputButton } from '@/components/voice-input-button';

import { ROUTES, type RootStackParamList } from '@/constants/routes';
import { SHARED_TRANSITION_TAGS } from '@/constants/shared-transition';

import { useVoiceInput } from '@/hooks/use-voice-input';
import { useVoiceTypingText } from '@/hooks/use-voice-typing-text';

import { Colors } from '@/theme/colors';
import { Sizes } from '@/theme/sizes';
import { Spacing } from '@/theme/spacing';

import { trim } from '@/utils/trim';

type Screen1NavProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof ROUTES.SCREEN_1
>;

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function Screen1() {
  const navigation = useNavigation<Screen1NavProp>();
  const isFocused = useIsFocused();
  const voiceTyping = useVoiceTypingText('');
  const { value: textValue, text, onChangeText, appendFromVoice } = voiceTyping;
  const voice = useVoiceInput();
  const returnProgress = useSharedValue(1);
  const wasBlurredRef = useRef(false);

  const hasText = trim(text).length > 0;
  const handleTranscription = useCallback(
    (transcribed: string) => appendFromVoice(transcribed),
    [appendFromVoice]
  );

  useEffect(() => {
    if (!isFocused) {
      wasBlurredRef.current = true;
      returnProgress.value = 0;
    }
  }, [isFocused, returnProgress]);

  useEffect(() => {
    if (isFocused && wasBlurredRef.current && hasText) {
      wasBlurredRef.current = false;
      returnProgress.value = withTiming(1, {
        duration: 0,
      });
    } else if (isFocused && !hasText) {
      returnProgress.value = 1;
    }
  }, [isFocused, hasText, returnProgress]);

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    opacity: returnProgress.value,
  }));

  const navigateToScreen2 = useCallback(
    (text1Value: string) => {
      navigation.push(ROUTES.SCREEN_2, { text1: text1Value });
    },
    [navigation]
  );

  const handleContinue = useCallback(() => {
    if (!hasText) return;
    navigateToScreen2(trim(text));
  }, [hasText, navigateToScreen2, text]);

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

          <AnimatedTextInput
            placeholder="Enter your first piece of text..."
            placeholderTextColor={Colors.text}
            value={textValue}
            onChangeText={onChangeText}
            multiline
            textAlignVertical="top"
            maxLength={1000}
            style={[stylesInput.input, inputAnimatedStyle]}
            sharedTransitionTag={SHARED_TRANSITION_TAGS.INPUT}
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
