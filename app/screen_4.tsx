import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  useRoute,
  useNavigation,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BlendLoadingView } from '@/components/blend-loading-view';
import { SharedScreenLayout } from '@/components/shared-screen-layout';

import { type BlendMode } from '@/constants/blend-modes';
import { ROUTES, type RootStackParamList } from '@/constants/routes';

import { blendWithClaude } from '@/services/claude-blend';

import { playResultSound } from '@/utils/result-sound';
import { trim } from '@/utils/trim';

const MIN_LOADING_DURATION_MS = 4000;

const LOADING_MESSAGES: Record<BlendMode, string> = {
  style_transfer: 'Rewriting in the other style…',
  mashup: 'Combining your texts…',
  debate: 'Writing dialogue…',
  poetry: 'Writing poem…',
};

type Screen4RouteProp = RouteProp<RootStackParamList, typeof ROUTES.SCREEN_4>;
type Screen4NavProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof ROUTES.SCREEN_4
>;

export default function Screen4() {
  const { params } = useRoute<Screen4RouteProp>();
  const navigation = useNavigation<Screen4NavProp>();
  const text1 = params?.text1 ?? '';
  const text2 = params?.text2 ?? '';
  const mode = (params?.mode ?? 'style_transfer') as BlendMode;
  const minLoadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const t1 = trim(text1);
  const t2 = trim(text2);

  const goToResult = useCallback(
    (result?: string, error?: string) => {
      navigation.replace(ROUTES.SCREEN_5, {
        text1: t1,
        text2: t2,
        mode,
        ...(result !== undefined && { result }),
        ...(error !== undefined && { error }),
      });
    },
    [navigation, t1, t2, mode]
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!t1 || !t2) {
        if (!cancelled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          playResultSound('error');
          goToResult(undefined, 'Nothing to blend.');
        }
        return;
      }

      const startedAt = Date.now();
      try {
        const blended = await blendWithClaude(t1, t2, { mode });
        if (!cancelled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          playResultSound('success');
          const elapsed = Date.now() - startedAt;
          const remaining = Math.max(0, MIN_LOADING_DURATION_MS - elapsed);
          if (remaining > 0) {
            minLoadingTimeoutRef.current = setTimeout(() => {
              minLoadingTimeoutRef.current = null;
              if (!cancelled) goToResult(blended);
            }, remaining);
          } else {
            goToResult(blended);
          }
        }
      } catch (e) {
        if (!cancelled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          playResultSound('error');
          const elapsed = Date.now() - startedAt;
          const remaining = Math.max(0, MIN_LOADING_DURATION_MS - elapsed);
          const errMsg = e instanceof Error ? e.message : 'Blend failed.';
          if (remaining > 0) {
            minLoadingTimeoutRef.current = setTimeout(() => {
              minLoadingTimeoutRef.current = null;
              if (!cancelled) goToResult(undefined, errMsg);
            }, remaining);
          } else {
            goToResult(undefined, errMsg);
          }
        }
      }
    }

    run();
    return () => {
      cancelled = true;
      const t = minLoadingTimeoutRef.current;
      if (t !== null) {
        clearTimeout(t);
        minLoadingTimeoutRef.current = null;
      }
    };
  }, [t1, t2, mode, goToResult]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SharedScreenLayout title="" onBackPress={handleBack}>
      <View style={styles.center}>
        <BlendLoadingView
          text1Preview={t1}
          text2Preview={t2}
          message={LOADING_MESSAGES[mode]}
        />
      </View>
    </SharedScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
});
