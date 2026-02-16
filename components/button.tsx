import { memo, type PropsWithChildren } from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

import { BorderRadius } from '@/theme/border-radius';
import { Colors } from '@/theme/colors';
import { FontSizes } from '@/theme/font-sizes';
import { Spacing } from '@/theme/spacing';

import { ThemedText } from './themed-text';

export type ButtonVariant = 'contained' | 'outlined' | 'text';

export type ButtonProps = PropsWithChildren<
  Omit<PressableProps, 'style'> & {
    variant?: ButtonVariant;
    title?: string;
    style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => ViewStyle);
    textStyle?: TextStyle;
  }
>;

export const Button = memo(function ({
  variant = 'contained',
  title,
  children,
  disabled = false,
  style,
  textStyle,
  ...pressableProps
}: ButtonProps) {
  const getContainerStyle = (pressed: boolean) => {
    const base = [
      variant === 'text' ? styles.buttonText : styles.button,
      variantStyles[variant].container,
    ];
    if (disabled) base.push(styles.buttonDisabled);
    else if (pressed) base.push(variantStyles[variant].pressed);
    return base;
  };

  const textColor = variant === 'contained' ? '#fff' : Colors.link;
  const content =
    children != null ? (
      children
    ) : title != null ? (
      <ThemedText color={textColor} style={[styles.buttonText, textStyle]}>
        {title}
      </ThemedText>
    ) : null;

  return (
    <Pressable
      style={({ pressed }) => [
        ...getContainerStyle(pressed),
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      disabled={disabled}
      {...pressableProps}
    >
      {content}
    </Pressable>
  );
});
Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing[14],
    paddingHorizontal: Spacing[24],
    borderRadius: BorderRadius[12],
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    fontSize: FontSizes[16],
    fontWeight: '600',
    alignItems: 'center',
  },
});

const variantStyles: Record<
  ButtonVariant,
  { container: ViewStyle; pressed: ViewStyle }
> = {
  contained: {
    container: {
      backgroundColor: Colors.tint,
      borderWidth: 1,
      borderColor: Colors.borderTint,
    },
    pressed: {
      opacity: 0.85,
    },
  },
  outlined: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: Colors.outlineButton,
    },
    pressed: {
      opacity: 0.85,
      backgroundColor: Colors.outlineButton + '18',
    },
  },
  text: {
    container: {
      backgroundColor: 'transparent',
    },
    pressed: {
      opacity: 0.7,
    },
  },
};
