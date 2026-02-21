import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  useRoute,
  useNavigation,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { IconSymbol } from '@/components/icon-symbol';
import { ListenButton } from '@/components/listen-button';
import { SharedScreenLayout } from '@/components/shared-screen-layout';
import { ThemedText } from '@/components/themed-text';

import { BLEND_MODE_LABELS, type BlendMode } from '@/constants/blend-modes';
import { ROUTES, type RootStackParamList } from '@/constants/routes';

import { useListenTTS } from '@/hooks/use-listen-tts';

import { Colors } from '@/theme/colors';
import { FontSizes } from '@/theme/font-sizes';
import { Sizes } from '@/theme/sizes';
import { Spacing } from '@/theme/spacing';

import { trim } from '@/utils/trim';

type Screen5RouteProp = RouteProp<RootStackParamList, typeof ROUTES.SCREEN_5>;
type Screen5NavProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof ROUTES.SCREEN_5
>;

export default function Screen5() {
  const { params } = useRoute<Screen5RouteProp>();
  const navigation = useNavigation<Screen5NavProp>();
  const text1 = params?.text1 ?? '';
  const text2 = params?.text2 ?? '';
  const mode = (params?.mode ?? 'style_transfer') as BlendMode;
  const result = params?.result ?? null;
  const error = params?.error ?? null;

  const {
    handleListen,
    handleStop,
    listenState,
    listenError,
    reset: resetListen,
  } = useListenTTS(result);

  const t1 = trim(text1);
  const t2 = trim(text2);

  useEffect(() => {
    if (result === null && error === null && t1 && t2) {
      navigation.replace(ROUTES.SCREEN_4, { text1: t1, text2: t2, mode });
    }
  }, [result, error, t1, t2, mode, navigation]);

  const navigateToModePicker = useCallback(() => {
    navigation.replace(ROUTES.SCREEN_3, { text1: t1, text2: t2 });
  }, [navigation, t1, t2]);

  const navigateToNewBlend = useCallback(() => {
    navigation.replace(ROUTES.SCREEN_1);
  }, [navigation]);

  const handleRetry = useCallback(() => {
    resetListen();
    navigation.replace(ROUTES.SCREEN_4, { text1: t1, text2: t2, mode });
  }, [navigation, t1, t2, mode, resetListen]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const newBlendButton =
    result !== null ? (
      <Button
        variant="text"
        onPress={navigateToNewBlend}
        style={styles.newBlendButton}
      >
        <IconSymbol name="plus" size={Sizes[20]} color={Colors.link} />
        <ThemedText style={styles.secondaryButtonText}>Add new</ThemedText>
      </Button>
    ) : undefined;

  if (result === null && error === null) {
    return (
      <SharedScreenLayout title="" onBackPress={handleBack}>
        <View style={styles.center} />
      </SharedScreenLayout>
    );
  }

  return (
    <SharedScreenLayout
      title="Your blend"
      onBackPress={handleBack}
      headerRight={newBlendButton}
    >
      <View style={styles.center}>
        {error ? (
          <View style={styles.resultWrap}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <Button
              variant="text"
              title="Try again"
              onPress={handleRetry}
              style={{ marginTop: 0 }}
            />
            <Button
              variant="text"
              title="Choose another mode"
              onPress={navigateToModePicker}
              textStyle={styles.secondaryButtonText}
              style={{ marginTop: 0 }}
            />
          </View>
        ) : result !== null ? (
          <View style={styles.resultWrap}>
            <ThemedText type="defaultSemiBold" style={styles.modeBadge}>
              Blend mode: {BLEND_MODE_LABELS[mode]}
            </ThemedText>
            <Card style={styles.resultCard}>
              <View style={styles.resultCardHeader}>
                <ThemedText type="subtitle" style={styles.resultLabel}>
                  Your blend
                </ThemedText>
                <ListenButton
                  listenState={listenState}
                  onListen={handleListen}
                  onStop={handleStop}
                />
                {listenError ? (
                  <ThemedText
                    style={[styles.listenError, { color: Colors.icon }]}
                    numberOfLines={2}
                  >
                    {listenError}
                  </ThemedText>
                ) : null}
              </View>

              <ThemedText style={styles.resultText}>{result}</ThemedText>
            </Card>
          </View>
        ) : null}
      </View>
    </SharedScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Sizes[200],
  },
  resultWrap: {
    width: '100%',
    paddingVertical: Spacing[16],
    gap: Spacing[12],
  },
  resultCard: {
    gap: Spacing[12],
  },
  resultCardHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  resultLabel: {
    color: Colors.cardTitle,
    fontWeight: '600',
  },
  resultText: {
    fontSize: FontSizes[16],
    lineHeight: 28,
    color: Colors.cardText,
  },
  listenError: {
    fontSize: FontSizes[13],
    flex: 1,
  },
  errorText: {
    fontSize: FontSizes[16],
    textAlign: 'center',
    marginBottom: Spacing[12],
    color: Colors.error,
  },
  newBlendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[8],
    marginTop: 0,
  },
  secondaryButtonText: {
    fontSize: FontSizes[15],
    color: Colors.link,
  },
  modeBadge: {
    fontSize: FontSizes[14],
    marginBottom: Spacing[4],
  },
});
