import React, { memo } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { BorderRadius } from '@/theme/border-radius';
import { FontSizes } from '@/theme/font-sizes';
import { Sizes } from '@/theme/sizes';
import { Spacing } from '@/theme/spacing';
import { Colors } from '@/theme/colors';

type BlendTextInputProps = TextInputProps & {
  onSubmit?: () => void;
};

export const BlendTextInput = memo(function ({
  style,
  placeholderTextColor = Colors.text,
  returnKeyType,
  ...rest
}: BlendTextInputProps) {
  return (
    <TextInput
      {...rest}
      style={[stylesInput.input, style]}
      placeholderTextColor={placeholderTextColor}
    />
  );
});
BlendTextInput.displayName = 'BlendTextInput';

export const stylesInput = StyleSheet.create({
  input: {
    flex: 1,
    minHeight: Sizes[200],
    maxHeight: Sizes[280],
    paddingHorizontal: Spacing[16],
    paddingVertical: Spacing[14],
    borderRadius: BorderRadius[10],
    fontSize: FontSizes[14],
    lineHeight: 24,
    color: Colors.text,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.text,
  },
});
