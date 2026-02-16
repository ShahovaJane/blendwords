import { useEffect, useState } from 'react';
import {
  Easing,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { BorderRadius } from '@/theme/border-radius';
import { FontSizes } from '@/theme/font-sizes';
import { Sizes } from '@/theme/sizes';
import { Spacing } from '@/theme/spacing';

const PILL_ANIMATION_DURATION_MS = 420;
const PILL_ANIMATION_EASING = Easing.out(Easing.cubic);
const PILL_ANIMATION_DELAY_MS = 80;
const LETTER_REVEAL_DURATION_MS = 1501;

export const LABEL_TEXT = 'Text 1 ✓';

export function useText1PillAnimation(
  text1Captured: boolean,
  previewLength: number
) {
  const shrinkProgress = useSharedValue(0);
  const revealProgress = useSharedValue(0);
  const totalLabelShared = useSharedValue(LABEL_TEXT.length);
  const totalPreviewShared = useSharedValue(0);

  const [visibleChars, setVisibleChars] = useState({ label: 0, preview: 0 });

  useEffect(() => {
    totalPreviewShared.value = previewLength;
  }, [previewLength, totalPreviewShared]);

  useEffect(() => {
    if (!text1Captured) return;
    setVisibleChars({ label: 0, preview: 0 });
    revealProgress.value = 0;
    const t = setTimeout(() => {
      shrinkProgress.value = withTiming(1, {
        duration: PILL_ANIMATION_DURATION_MS,
        easing: PILL_ANIMATION_EASING,
      });
      revealProgress.value = withTiming(1, {
        duration: LETTER_REVEAL_DURATION_MS,
        easing: PILL_ANIMATION_EASING,
      });
    }, PILL_ANIMATION_DELAY_MS);
    return () => clearTimeout(t);
  }, [text1Captured, shrinkProgress, revealProgress]);

  useAnimatedReaction(
    () => revealProgress.value,
    (v) => {
      const totalLabel = totalLabelShared.value;
      const totalPreview = totalPreviewShared.value;
      const total = totalLabel + totalPreview;
      const visible = Math.round(v * total);
      const labelVisible = Math.min(totalLabel, visible);
      const previewVisible = Math.min(
        totalPreview,
        Math.max(0, visible - totalLabel)
      );
      scheduleOnRN(setVisibleChars, {
        label: labelVisible,
        preview: previewVisible,
      });
    }
  );

  const text1PillAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(shrinkProgress.value, [0, 1], [1, 1]) }],
    paddingVertical: interpolate(
      shrinkProgress.value,
      [0, 1],
      [Spacing[20], Spacing[10]]
    ),
    paddingHorizontal: interpolate(
      shrinkProgress.value,
      [0, 1],
      [Spacing[24], Spacing[16]]
    ),
    borderRadius: interpolate(
      shrinkProgress.value,
      [0, 1],
      [BorderRadius[16], BorderRadius[24]]
    ),
    opacity: interpolate(shrinkProgress.value, [0, 0.15], [1, 1]),
  }));

  const text1LabelAnimatedStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      shrinkProgress.value,
      [0, 1],
      [FontSizes[14], FontSizes[12]]
    ),
    opacity: interpolate(shrinkProgress.value, [0, 0.6], [0.85, 1]),
  }));

  const text1PreviewAnimatedStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      shrinkProgress.value,
      [0, 1],
      [FontSizes[14], FontSizes[12]]
    ),
    maxHeight: interpolate(
      shrinkProgress.value,
      [0, 1],
      [Sizes[80], Sizes[22]]
    ),
  }));

  return {
    visibleChars,
    text1PillAnimatedStyle,
    text1LabelAnimatedStyle,
    text1PreviewAnimatedStyle,
  };
}
