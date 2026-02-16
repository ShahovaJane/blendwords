import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { BorderRadius } from '@/theme/border-radius';
import { Colors } from '@/theme/colors';
import { Sizes } from '@/theme/sizes';
import { Spacing } from '@/theme/spacing';

import { IconSymbol } from './icon-symbol';
import { ThemedText } from './themed-text';

type StoredConfirmationRowProps = {
  message?: string;
};

export const StoredConfirmationRow = memo(function ({
  message = 'Your text is now stored',
}: StoredConfirmationRowProps) {
  return (
    <View style={styles.capturedRow}>
      <View style={styles.checkBadge}>
        <IconSymbol name="checkmark" size={Sizes[16]} color={Colors.tint} />
      </View>
      <ThemedText type="defaultSemiBold">{message}</ThemedText>
    </View>
  );
});
StoredConfirmationRow.displayName = 'StoredConfirmationRow';

const styles = StyleSheet.create({
  capturedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[10],
  },
  checkBadge: {
    width: Sizes[22],
    height: Sizes[22],
    borderRadius: BorderRadius[14],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.text,
  },
});
