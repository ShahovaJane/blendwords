import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Card } from '@/components/card';
import { SharedScreenLayout } from '@/components/shared-screen-layout';
import { ThemedText } from '@/components/themed-text';

import {
  BLEND_MODE_DESCRIPTIONS,
  BLEND_MODE_LABELS,
  type BlendMode,
} from '@/constants/blend-modes';
import { ROUTES } from '@/constants/routes';

import { Colors } from '@/theme/colors';
import { FontSizes } from '@/theme/font-sizes';
import { Sizes } from '@/theme/sizes';
import { Spacing } from '@/theme/spacing';

import { trim } from '@/utils/trim';

const BLEND_MODES: BlendMode[] = [
  'style_transfer',
  'mashup',
  'debate',
  'poetry',
];

export default function ModePickerScreen() {
  const { text1 = '', text2 = '' } = useLocalSearchParams<{
    text1?: string;
    text2?: string;
  }>();
  const router = useRouter();

  const handleSelectMode = useCallback(
    (mode: BlendMode) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: `/${ROUTES.SCREEN_4}`,
        params: {
          text1: trim(text1),
          text2: trim(text2),
          mode,
        },
      });
    },
    [router, text1, text2]
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const t1 = trim(text1);
  const t2 = trim(text2);
  const hasBothTexts = t1.length > 0 && t2.length > 0;

  return (
    <SharedScreenLayout title="Choose a mixing mode" onBackPress={handleBack}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.center}>
          {hasBothTexts ? (
            <View style={styles.modePicker}>
              {BLEND_MODES.map((mode) => (
                <Card
                  key={mode}
                  onPress={() => handleSelectMode(mode)}
                  style={styles.modeCard}
                >
                  <ThemedText type="defaultSemiBold" style={styles.modeLabel}>
                    {BLEND_MODE_LABELS[mode]}
                  </ThemedText>
                  <ThemedText
                    style={[styles.modeDescription, { color: Colors.icon }]}
                  >
                    {BLEND_MODE_DESCRIPTIONS[mode]}
                  </ThemedText>
                </Card>
              ))}
            </View>
          ) : (
            <ThemedText type="subtitle" style={styles.emptyMessage}>
              Nothing to mix. Add text on the previous screens.
            </ThemedText>
          )}
        </View>
      </ScrollView>
    </SharedScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing[24],
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Sizes[200],
  },
  modePicker: {
    width: '100%',
    gap: Spacing[14],
    marginTop: Spacing[26],
  },
  pickerTitle: {
    marginBottom: Spacing[8],
    textAlign: 'center',
  },
  modeCard: {
    gap: Spacing[4],
  },
  modeLabel: {
    fontSize: FontSizes[17],
    color: Colors.tint,
  },
  modeDescription: {
    fontSize: FontSizes[14],
    lineHeight: 20,
  },
  emptyMessage: {
    textAlign: 'center',
  },
});
