import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ROUTES } from '@/constants/routes';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          animationDuration: 600,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name={ROUTES.SCREEN_1} />
        <Stack.Screen name={ROUTES.SCREEN_2} />
        <Stack.Screen name={ROUTES.SCREEN_3} />
        <Stack.Screen name={ROUTES.SCREEN_4} />
      </Stack>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
