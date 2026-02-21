import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card } from '@/components/card';
import { SharedScreenLayout } from '@/components/shared-screen-layout';
import { ThemedText } from '@/components/themed-text';

import {
  BLEND_MODE_DESCRIPTIONS,
  BLEND_MODE_LABELS,
  type BlendMode,
} from '@/constants/blend-modes';
import { ROUTES, type RootStackParamList } from '@/constants/routes';

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

type Screen3RouteProp = RouteProp<RootStackParamList, typeof ROUTES.SCREEN_3>;
type Screen3NavProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof ROUTES.SCREEN_3
>;

export default function ModePickerScreen() {
  const { params } = useRoute<Screen3RouteProp>();
  const navigation = useNavigation<Screen3NavProp>();
  const text1 = params?.text1 ?? '';
  const text2 = params?.text2 ?? '';

  const handleSelectMode = useCallback(
    (mode: BlendMode) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      navigation.push(ROUTES.SCREEN_4, {
        text1: trim(text1),
        text2: trim(text2),
        mode,
      });
    },
    [navigation, text1, text2]
  );

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
