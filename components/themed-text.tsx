import { memo } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontSizes } from '@/theme/font-sizes';
import { Colors } from '@/theme/colors';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  color?: string;
};

export const ThemedText = memo(function ({
  style,
  type = 'default',
  color,
  ...rest
}: ThemedTextProps) {
  const textColor = color || Colors.text;

  return (
    <Text
      style={[
        { color: textColor },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        style,
      ]}
      {...rest}
    />
  );
});
ThemedText.displayName = 'ThemedText';

const styles = StyleSheet.create({
  default: {
    fontSize: FontSizes[14],
    lineHeight: 24,
    color: Colors.text,
  },
  defaultSemiBold: {
    fontSize: FontSizes[14],
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: FontSizes[20],
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: FontSizes[16],
  },
});
