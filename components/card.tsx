import { memo, type PropsWithChildren, useMemo } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { BorderRadius } from '@/theme/border-radius';
import { Sizes } from '@/theme/sizes';
import { Spacing } from '@/theme/spacing';
import { Colors } from '@/theme/colors';

export type CardProps = PropsWithChildren<{
  onPress?: () => void;
  style?: ViewStyle;
  pressedStyle?: ViewStyle;
}>;

export const Card = memo(function ({
  children,
  onPress,
  style,
  pressedStyle,
}: CardProps) {
  const isPressable = onPress != null;

  const containerStyle = useMemo(() => [styles.card, style], [style]);

  if (isPressable) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          containerStyle,
          pressed && (pressedStyle ?? styles.pressed),
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{children}</View>;
});

Card.displayName = 'Card';

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius[12],
    padding: Spacing[16],
    minHeight: Sizes[48],
  },
  pressed: {
    opacity: 0.85,
  },
});
