import { useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BlendTextInput } from '@/components/text-input';
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
import { BorderRadius } from '@/theme/border-radius';
import { FontSizes } from '@/theme/font-sizes';
import { Sizes } from '@/theme/sizes';
import { Spacing } from '@/theme/spacing';

import { trim } from '@/utils/trim';

const PREVIEW_MAX_LENGTH = 40;

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

function truncateForPreview(str: string, max: number = PREVIEW_MAX_LENGTH) {
  const t = trim(str);
  if (t.length <= max) return t;
  return trim(t.slice(0, max)) + '…';
}

type Screen2RouteProp = RouteProp<RootStackParamList, typeof ROUTES.SCREEN_2>;
type Screen2NavProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof ROUTES.SCREEN_2
>;

export default function Screen2() {
  const { params } = useRoute<Screen2RouteProp>();
  const navigation = useNavigation<Screen2NavProp>();
  const text1 = params?.text1 ?? '';
  const voiceTyping = useVoiceTypingText('');
  const { value: textValue, text, onChangeText, appendFromVoice } = voiceTyping;
  const voice = useVoiceInput();

  const text1Captured = trim(text1).length > 0;
  const previewText = text1 ? truncateForPreview(text1) : '';
  const hasText = trim(text).length > 0;
  const canBlend = text1Captured && hasText;

  const handleTranscription = useCallback(
    (transcribed: string) => appendFromVoice(transcribed),
    [appendFromVoice]
  );

  const handleBlend = useCallback(() => {
    if (!canBlend) return;
    navigation.push(ROUTES.SCREEN_3, {
      text1: trim(text1),
      text2: trim(text),
    });
  }, [canBlend, navigation, text, text1]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
            <AnimatedTextInput
              value={'Text 1 ✓ ' + previewText}
              editable={false}
              pointerEvents="none"
              style={[styles.text1PillInput]}
              placeholderTextColor={Colors.text}
              sharedTransitionTag={SHARED_TRANSITION_TAGS.INPUT}
            />
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
          value={textValue}
          onChangeText={onChangeText}
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
  text1PillInput: {
    alignSelf: 'center',
    maxWidth: '100%',
    paddingVertical: Spacing[10],
    paddingHorizontal: Spacing[16],
    borderRadius: BorderRadius[24],
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderTint,
    fontSize: FontSizes[12],
    fontWeight: '500',
    color: Colors.text,
  },
  submitButton: {
    marginTop: Spacing[8],
  },
});
