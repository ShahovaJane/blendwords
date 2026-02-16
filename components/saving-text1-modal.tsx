import { memo, useEffect } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { BorderRadius } from '@/theme/border-radius';
import { Colors } from '@/theme/colors';
import { FontSizes } from '@/theme/font-sizes';
import { Sizes } from '@/theme/sizes';
import { Spacing } from '@/theme/spacing';

import { IconSymbol } from './icon-symbol';

const SAVING_DURATION_MS = 1000;
const SUCCESS_DURATION_MS = 800;
const FADE_OUT_MS = 300;

type SavingText1ModalProps = {
  visible: boolean;
  onComplete: () => void;
};

export const SavingText1Modal = memo(function ({
  visible,
  onComplete,
}: SavingText1ModalProps) {
  const progress = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      progress.value = 0;
      overlayOpacity.value = 0;
      return;
    }

    overlayOpacity.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });

    progress.value = withSequence(
      withTiming(1, {
        duration: SAVING_DURATION_MS,
        easing: Easing.inOut(Easing.ease),
      }),
      withDelay(
        SUCCESS_DURATION_MS,
        withTiming(2, {
          duration: FADE_OUT_MS,
          easing: Easing.out(Easing.cubic),
        })
      )
    );

    const totalMs = SAVING_DURATION_MS + SUCCESS_DURATION_MS + FADE_OUT_MS;
    const t = setTimeout(() => {
      onComplete();
    }, totalMs);
    return () => clearTimeout(t);
  }, [visible, progress, overlayOpacity, onComplete]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [1.8, 2], [1, 0]),
    transform: [
      {
        scale: interpolate(progress.value, [1.8, 2], [1, 0.95]),
      },
    ],
  }));

  const loadingOpacity = useAnimatedStyle(() => ({
    opacity:
      interpolate(progress.value, [0, 0.15], [0, 1]) *
      (1 - interpolate(progress.value, [0.65, 0.85], [0, 1])),
  }));

  const checkmarkOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.65, 0.9], [0, 1]),
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.iconContainer}>
            <Animated.View style={[styles.iconOverlay, loadingOpacity]}>
              <ActivityIndicator size="small" color={Colors.tint} />
            </Animated.View>
            <Animated.View style={[styles.checkmarkWrap, checkmarkOpacity]}>
              <IconSymbol
                name="checkmark"
                size={Sizes[18]}
                color={Colors.tint}
              />
            </Animated.View>
          </View>
          <View style={styles.messageWrap}>
            <Animated.Text style={[styles.message, loadingOpacity]}>
              Saving Text 1…
            </Animated.Text>
            <Animated.Text
              style={[styles.message, styles.messageAbsolute, checkmarkOpacity]}
            >
              Text 1 stored
            </Animated.Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
});
SavingText1Modal.displayName = 'SavingText1Modal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.modalBg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[24],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[12],
    backgroundColor: Colors.card,
    paddingVertical: Spacing[16],
    paddingHorizontal: Spacing[20],
    borderRadius: BorderRadius[16],
    maxWidth: '100%',
    minWidth: Sizes[220],
  },
  iconContainer: {
    width: Sizes[28],
    height: Sizes[28],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkWrap: {
    width: Sizes[28],
    height: Sizes[28],
    borderRadius: BorderRadius[14],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.text,
  },
  messageWrap: {
    flex: 1,
    minHeight: FontSizes[16] * 1.3,
  },
  message: {
    fontSize: FontSizes[16],
    fontWeight: '600',
    color: Colors.tint,
  },
  messageAbsolute: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
