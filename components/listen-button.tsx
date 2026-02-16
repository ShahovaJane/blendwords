import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { IconSymbol } from '@/components/icon-symbol';

import { LISTEN_STATE, type ListenState } from '@/constants/listen-state';

import { BorderRadius } from '@/theme/border-radius';
import { Colors } from '@/theme/colors';
import { Sizes } from '@/theme/sizes';
import { Spacing } from '@/theme/spacing';

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
  return (
    <Pressable
      onPress={listenState === LISTEN_STATE.PLAYING ? onStop : onListen}
      disabled={listenState === LISTEN_STATE.LOADING}
      style={({ pressed }) => [
        styles.listenButton,
        {
          opacity:
            listenState === LISTEN_STATE.LOADING ? 0.6 : pressed ? 0.9 : 1,
        },
      ]}
    >
      {listenState === LISTEN_STATE.LOADING ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : listenState === LISTEN_STATE.PLAYING ? (
        <IconSymbol name="stop.fill" size={Sizes[18]} color="#fff" />
      ) : (
        <IconSymbol name="play.fill" size={Sizes[18]} color="#fff" />
      )}
    </Pressable>
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
