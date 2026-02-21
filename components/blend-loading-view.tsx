import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';

import { SHARED_TRANSITION_TAGS } from '@/constants/shared-transition';

import { BorderRadius } from '@/theme/border-radius';
import { Colors } from '@/theme/colors';
import { FontSizes } from '@/theme/font-sizes';
import { Sizes } from '@/theme/sizes';
import { Spacing } from '@/theme/spacing';

import { trim } from '@/utils/trim';

const ORB_SIZE = Sizes[80];
const MIX_ZONE_WIDTH = Sizes[178];
const PARTICLE_COUNT = 8;
const ORB_LABEL_MAX = 12;

function truncateForOrb(str: string, max: number = ORB_LABEL_MAX): string {
  const t = trim(str);
  if (t.length <= max) return t;
  return trim(t.slice(0, max)) + '…';
}

const glowColor = `rgba(162, 158, 184, 0.5)`;

const PARTICLE_COLORS = ['#a7a6d5', '#ffffff', '#212646'];

const FloatingParticle = memo(function ({
  index,
  ringProgress,
  flyIn,
  particlePhases,
}: {
  index: number;
  ringProgress: SharedValue<number>;
  flyIn: SharedValue<number>;
  particlePhases: SharedValue<number[]>;
}) {
  const style = useAnimatedStyle(() => {
    const phase = (particlePhases.value[index] ?? 0) + ringProgress.value;
    const angle = (phase % 1) * Math.PI * 2;
    const radius = 56 + (index % 3) * 16;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.6;
    const opacity =
      interpolate(flyIn.value, [0.5, 0.9], [0, 0.7]) *
      (0.4 + (index % 3) * 0.15);
    return {
      transform: [{ translateX: x }, { translateY: y }],
      opacity,
    };
  });
  return (
    <Animated.View
      style={[
        styles.particle,
        { backgroundColor: PARTICLE_COLORS[index % PARTICLE_COLORS.length] },
        style,
      ]}
    />
  );
});
FloatingParticle.displayName = 'FloatingParticle';

type BlendLoadingViewProps = {
  text1Preview: string;
  text2Preview: string;
  message: string;
};

export const BlendLoadingView = memo(function ({
  text1Preview,
  text2Preview,
  message,
}: BlendLoadingViewProps) {
  // Fly-in: 0 = at sides, 1 = converged in mix zone
  const flyIn = useSharedValue(0);
  // Merge/orbit in center: 0..1 loop for continuous magic
  const mergePulse = useSharedValue(0);
  // Outer ring progress (indeterminate)
  const ringProgress = useSharedValue(0);
  // Glow breath
  const glowOpacity = useSharedValue(0.4);
  // Particle offsets (each particle has its own phase)
  const particlePhases = useSharedValue(
    Array.from({ length: PARTICLE_COUNT }, () => Math.random())
  );

  useEffect(() => {
    flyIn.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });

    mergePulse.value = withDelay(
      400,
      withRepeat(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );

    ringProgress.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.linear }),
      -1,
      false
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [flyIn, mergePulse, ringProgress, glowOpacity]);

  // Left orb: from left into mix zone (converged = base position, so translateX 0)
  const orb1Style = useAnimatedStyle(() => {
    const x = interpolate(flyIn.value, [0, 1], [-MIX_ZONE_WIDTH - ORB_SIZE, 0]);
    const y = interpolate(mergePulse.value, [0, 0.5, 1], [0, -16, 0]);
    const scale = interpolate(mergePulse.value, [0, 0.5, 1], [1, 1.08, 1]);
    return {
      transform: [{ translateX: x }, { translateY: y }, { scale }],
      opacity: interpolate(flyIn.value, [0, 0.3], [0, 1]),
    };
  });

  // Right orb: from right into mix zone
  const orb2Style = useAnimatedStyle(() => {
    const x = interpolate(flyIn.value, [0, 1], [MIX_ZONE_WIDTH + ORB_SIZE, 0]);
    const y = interpolate(mergePulse.value, [0, 0.5, 1], [0, 16, 0]);
    const scale = interpolate(mergePulse.value, [0, 0.5, 1], [1, 1.08, 1]);
    return {
      transform: [{ translateX: x }, { translateY: y }, { scale }],
      opacity: interpolate(flyIn.value, [0, 0.3], [0, 1]),
    };
  });

  // Central merged glow (appears as orbs converge)
  const centerGlowStyle = useAnimatedStyle(() => {
    const scale = interpolate(flyIn.value, [0.2, 0.8], [0.3, 1.2]);
    const opacity =
      interpolate(flyIn.value, [0.3, 0.7], [0, 1]) * glowOpacity.value;
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Indeterminate progress ring
  const ringStyle = useAnimatedStyle(() => {
    const rotation = interpolate(ringProgress.value, [0, 1], [0, 360]);
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const ringInnerOpacity = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * 0.6,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.mixZone}>
        <Animated.View style={[styles.centerGlow, centerGlowStyle]} />

        {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
          <FloatingParticle
            key={i}
            index={i}
            ringProgress={ringProgress}
            flyIn={flyIn}
            particlePhases={particlePhases}
          />
        ))}

        <Animated.View style={[styles.ringOuter, ringStyle]}>
          <View style={styles.ringSegment} />
          <View style={[styles.ringSegment, styles.ringSegmentOffset]} />
        </Animated.View>
        <Animated.View style={[styles.ringGlow, ringInnerOpacity]} />

        <Animated.View style={[styles.orb, styles.orbLeft, orb1Style]}>
          <ThemedText style={styles.orbLabel} numberOfLines={1}>
            {truncateForOrb(text1Preview)}
          </ThemedText>
        </Animated.View>

        <Animated.View
          style={[styles.orb, styles.orbRight, orb2Style]}
          sharedTransitionTag={SHARED_TRANSITION_TAGS.LOADING}
        >
          <ThemedText style={styles.orbLabel} numberOfLines={1}>
            {truncateForOrb(text2Preview)}
          </ThemedText>
        </Animated.View>
      </View>

      <ThemedText type="subtitle" style={styles.message}>
        {message}
      </ThemedText>
    </View>
  );
});
BlendLoadingView.displayName = 'BlendLoadingView';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing[50],
  },
  mixZone: {
    width: Sizes[280],
    height: Sizes[200],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerGlow: {
    position: 'absolute',
    width: Sizes[140],
    height: Sizes[140],
    borderRadius: BorderRadius[70],
    backgroundColor: glowColor,
    shadowColor: Colors.tint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 12,
  },
  particle: {
    position: 'absolute',
    width: Sizes[18],
    height: Sizes[18],
    borderRadius: BorderRadius[9],
  },
  ringOuter: {
    position: 'absolute',
    width: Sizes[112],
    height: Sizes[112],
    borderRadius: BorderRadius[56],
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: Colors.tint,
    borderRightColor: Colors.tint,
    opacity: 0.7,
  },
  ringSegment: {
    position: 'absolute',
    width: Sizes[112],
    height: Sizes[112],
    borderRadius: BorderRadius[56],
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: Colors.tint,
    borderRightColor: Colors.tint,
  },
  ringSegmentOffset: {
    transform: [{ rotate: '180deg' }],
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.tint,
    borderLeftColor: Colors.tint,
  },
  ringGlow: {
    position: 'absolute',
    width: Sizes[100],
    height: Sizes[100],
    borderRadius: BorderRadius[50],
    borderWidth: 1,
    borderColor: Colors.tint,
  },
  orb: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[6],
    shadowColor: Colors.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  orbLeft: {
    left: '50%',
    marginLeft: -MIX_ZONE_WIDTH / 2 - ORB_SIZE / 2,
  },
  orbRight: {
    left: '50%',
    marginLeft: MIX_ZONE_WIDTH / 2 - ORB_SIZE / 2,
  },
  orbLabel: {
    fontSize: FontSizes[14],
    fontWeight: '600',
    color: Colors.tint,
    textAlign: 'center',
  },
  message: {
    marginTop: Spacing[24],
    textAlign: 'center',
    fontWeight: '600',
  },
});
