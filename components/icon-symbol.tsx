import { ComponentProps, memo } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';

type IconMapping = Record<
  SymbolViewProps['name'],
  ComponentProps<typeof MaterialIcons>['name']
>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  'chevron.left': 'arrow-back',
  'play.fill': 'play-arrow',
  'stop.fill': 'stop',
  plus: 'add',
  checkmark: 'check',
} as IconMapping;

export const IconSymbol = memo(function ({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
});
IconSymbol.displayName = 'IconSymbol';
