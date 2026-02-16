import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { BlendLoadingView } from '@/components/blend-loading-view';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { IconSymbol } from '@/components/icon-symbol';
import { ListenButton } from '@/components/listen-button';
import { SharedScreenLayout } from '@/components/shared-screen-layout';
import { ThemedText } from '@/components/themed-text';

import { BLEND_MODE_LABELS, type BlendMode } from '@/constants/blend-modes';
import { ROUTES } from '@/constants/routes';

import { useListenTTS } from '@/hooks/use-listen-tts';

import { blendWithClaude } from '@/services/claude-blend';

import { Colors } from '@/theme/colors';
import { FontSizes } from '@/theme/font-sizes';
import { Sizes } from '@/theme/sizes';
import { Spacing } from '@/theme/spacing';

import { playResultSound } from '@/utils/result-sound';
import { trim } from '@/utils/trim';

const MIN_LOADING_DURATION_MS = 4000;

const LOADING_MESSAGES: Record<BlendMode, string> = {
  style_transfer: 'Rewriting in the other style…',
  mashup: 'Combining your texts…',
  debate: 'Writing dialogue…',
  poetry: 'Writing poem…',
};

export default function BlendResultScreen() {
  const {
    text1 = '',
    text2 = '',
    mode: modeParam,
  } = useLocalSearchParams<{
    text1?: string;
    text2?: string;
    mode?: string;
  }>();
  const mode = (modeParam ?? 'style_transfer') as BlendMode;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const minLoadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const {
    handleListen,
    handleStop,
    listenState,
    listenError,
    reset: resetListen,
  } = useListenTTS(result);
  const pendingHapticRef = useRef<'success' | 'error' | null>(null);

  const hideLoadingWithHaptic = useCallback(() => {
    const type = pendingHapticRef.current;
    pendingHapticRef.current = null;
    if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playResultSound('success');
    } else if (type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      playResultSound('error');
    }
    setLoading(false);
  }, []);

  const t1 = trim(text1);
  const t2 = trim(text2);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!t1 || !t2) {
        setError('Nothing to blend.');
        pendingHapticRef.current = 'error';
        hideLoadingWithHaptic();
        return;
      }
      const startedAt = Date.now();
      try {
        const blended = await blendWithClaude(t1, t2, { mode });
        if (!cancelled) {
          setResult(blended);
          pendingHapticRef.current = 'success';
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Blend failed.');
          pendingHapticRef.current = 'error';
        }
      } finally {
        if (!cancelled) {
          const elapsed = Date.now() - startedAt;
          const remaining = Math.max(0, MIN_LOADING_DURATION_MS - elapsed);
          if (remaining > 0) {
            minLoadingTimeoutRef.current = setTimeout(() => {
              minLoadingTimeoutRef.current = null;
              if (!cancelled) hideLoadingWithHaptic();
            }, remaining);
          } else {
            hideLoadingWithHaptic();
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
  }, [t1, t2, mode, hideLoadingWithHaptic]);

  const router = useRouter();
  const navigateToModePicker = useCallback(() => {
    router.replace({
      pathname: `/${ROUTES.SCREEN_3}`,
      params: { text1: t1, text2: t2 },
    });
  }, [router, t1, t2]);

  const navigateToNewBlend = useCallback(() => {
    router.replace(`/${ROUTES.SCREEN_1}`);
  }, [router]);

  const handleRetry = useCallback(async () => {
    setError(null);
    setResult(null);
    resetListen();
    setLoading(true);
    const startedAt = Date.now();
    try {
      const blended = await blendWithClaude(t1, t2, { mode });
      setResult(blended);
      pendingHapticRef.current = 'success';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Blend failed.');
      pendingHapticRef.current = 'error';
    } finally {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, MIN_LOADING_DURATION_MS - elapsed);
      if (remaining > 0) {
        setTimeout(() => hideLoadingWithHaptic(), remaining);
      } else {
        hideLoadingWithHaptic();
      }
    }
  }, [t1, t2, mode, hideLoadingWithHaptic, resetListen]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const newBlendButton =
    !loading && result !== null ? (
      <Button
        variant="text"
        onPress={navigateToNewBlend}
        style={styles.newBlendButton}
      >
        <IconSymbol name="plus" size={Sizes[20]} color={Colors.link} />
        <ThemedText style={styles.secondaryButtonText}>Add new</ThemedText>
      </Button>
    ) : undefined;

  return (
    <SharedScreenLayout
      title={!loading ? 'Your blend' : undefined}
      onBackPress={handleBack}
      headerRight={newBlendButton}
    >
      <View style={styles.center}>
        {loading ? (
          <BlendLoadingView
            text1Preview={t1}
            text2Preview={t2}
            message={LOADING_MESSAGES[mode]}
          />
        ) : error ? (
          <View style={styles.resultWrap}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <Button
              variant="text"
              title="Try again"
              onPress={handleRetry}
              style={{ marginTop: 0 }}
            />
            <Button
              variant="text"
              title="Choose another mode"
              onPress={navigateToModePicker}
              textStyle={styles.secondaryButtonText}
              style={{ marginTop: 0 }}
            />
          </View>
        ) : result !== null ? (
          <View style={styles.resultWrap}>
            <ThemedText type="defaultSemiBold" style={styles.modeBadge}>
              Blend mode: {BLEND_MODE_LABELS[mode]}
            </ThemedText>
            <Card style={styles.resultCard}>
              <View style={styles.resultCardHeader}>
                <ThemedText type="subtitle" style={styles.resultLabel}>
                  Your blend
                </ThemedText>
                <ListenButton
                  listenState={listenState}
                  onListen={handleListen}
                  onStop={handleStop}
                />
                {listenError ? (
                  <ThemedText
                    style={[styles.listenError, { color: Colors.icon }]}
                    numberOfLines={2}
                  >
                    {listenError}
                  </ThemedText>
                ) : null}
              </View>

              <ThemedText style={styles.resultText}>{result}</ThemedText>
            </Card>
          </View>
        ) : null}
      </View>
    </SharedScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Sizes[200],
  },
  resultWrap: {
    width: '100%',
    paddingVertical: Spacing[16],
    gap: Spacing[12],
  },
  resultCard: {
    gap: Spacing[12],
  },
  resultCardHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  resultLabel: {
    color: Colors.cardTitle,
    fontWeight: '600',
  },
  resultText: {
    fontSize: FontSizes[16],
    lineHeight: 28,
    color: Colors.cardText,
  },
  listenError: {
    fontSize: FontSizes[13],
    flex: 1,
  },
  errorText: {
    fontSize: FontSizes[16],
    textAlign: 'center',
    marginBottom: Spacing[12],
    color: Colors.error,
  },
  newBlendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[8],
    marginTop: 0,
  },
  secondaryButtonText: {
    fontSize: FontSizes[15],
    color: Colors.link,
  },
  modeBadge: {
    fontSize: FontSizes[14],
    marginBottom: Spacing[4],
  },
});
