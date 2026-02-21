import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { IconSymbol } from '@/components/icon-symbol';

import { LISTEN_STATE, type ListenState } from '@/constants/listen-state';
import { SHARED_TRANSITION_TAGS } from '@/constants/shared-transition';

import { BorderRadius } from '@/theme/border-radius';
import { Colors } from '@/theme/colors';
import { Sizes } from '@/theme/sizes';
import { Spacing } from '@/theme/spacing';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ListenButtonProps = {
  listenState: ListenState;
  onListen: () => void;
  onStop: () => void;
};

export const ListenButton = memo(function ({
  listenState,
  onListen,
  onStop,
}: ListenButtonProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(pressed.value ? 0.9 : 1, { duration: 80 }),
  }));

  return (
    <AnimatedPressable
      onPress={listenState === LISTEN_STATE.PLAYING ? onStop : onListen}
      onPressIn={() => (pressed.value = 1)}
      onPressOut={() => (pressed.value = 0)}
      disabled={listenState === LISTEN_STATE.LOADING}
      style={[
        styles.listenButton,
        animatedStyle,
        listenState === LISTEN_STATE.LOADING && { opacity: 0.6 },
      ]}
      sharedTransitionTag={SHARED_TRANSITION_TAGS.LOADING}
    >
      {listenState === LISTEN_STATE.LOADING ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : listenState === LISTEN_STATE.PLAYING ? (
        <IconSymbol name="stop.fill" size={Sizes[18]} color="#fff" />
      ) : (
        <IconSymbol name="play.fill" size={Sizes[18]} color="#fff" />
      )}
    </AnimatedPressable>
  );
});
ListenButton.displayName = 'ListenButton';

const styles = StyleSheet.create({
  listenButton: {
    paddingVertical: Spacing[10],
    paddingHorizontal: Spacing[10],
    borderRadius: BorderRadius[40],
    minWidth: Sizes[40],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.tint,
  },
});
