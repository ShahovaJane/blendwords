import { memo, type ReactNode } from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/theme/colors';
import { Sizes } from '@/theme/sizes';
import { Spacing } from '@/theme/spacing';

import { Button } from './button';
import { IconSymbol } from './icon-symbol';
import { ThemedText } from './themed-text';

const backgroundImage = require('../assets/images/background.png');

type SharedScreenLayoutProps = {
  children: ReactNode;
  title?: string;
  onBackPress?: () => void;
  headerRight?: ReactNode;
};

export const SharedScreenLayout = memo(function ({
  children,
  title,
  onBackPress,
  headerRight,
}: SharedScreenLayoutProps) {
  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeIn.duration(1000)}
            style={styles.animatedContent}
          >
            {(title != null || onBackPress != null || headerRight != null) && (
              <View style={styles.header}>
                {onBackPress != null || headerRight != null ? (
                  <View style={styles.headerRow}>
                    {onBackPress != null && (
                      <Button
                        variant="text"
                        onPress={onBackPress}
                        style={styles.backButton}
                      >
                        <IconSymbol
                          name="chevron.left"
                          size={Sizes[24]}
                          color={Colors.link}
                        />
                      </Button>
                    )}
                    {title != null && (
                      <View style={styles.headerTitleCenter}>
                        <ThemedText type="title" style={styles.headerText}>
                          {title}
                        </ThemedText>
                      </View>
                    )}
                    {headerRight != null ? (
                      <View style={styles.headerRight}>{headerRight}</View>
                    ) : (
                      <View style={styles.headerRight} />
                    )}
                  </View>
                ) : (
                  title != null && (
                    <ThemedText type="title" style={styles.headerText}>
                      {title}
                    </ThemedText>
                  )
                )}
              </View>
            )}
            <View style={styles.content}>{children}</View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
});
SharedScreenLayout.displayName = 'SharedScreenLayout';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing[20],
    paddingBottom: Spacing[40],
  },
  header: {
    marginBottom: Spacing[10],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  headerRight: {
    marginLeft: 'auto',
  },
  headerTitleCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    marginTop: 0,
  },
  headerText: {
    textAlign: 'center',
  },
  animatedContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    gap: Spacing[16],
  },
});
