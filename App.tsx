import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ROUTES, type RootStackParamList } from '@/constants/routes';

import Screen1 from '@/app/screen_1';
import Screen2 from '@/app/screen_2';
import Screen3 from '@/app/screen_3';
import Screen4 from '@/app/screen_4';
import Screen5 from '@/app/screen_5';
import { Colors } from '@/theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={ROUTES.SCREEN_1}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.borderTint },
          }}
        >
          <Stack.Screen
            name={ROUTES.SCREEN_1}
            component={Screen1}
            options={{ freezeOnBlur: false }}
          />
          <Stack.Screen
            name={ROUTES.SCREEN_2}
            component={Screen2}
            options={{ freezeOnBlur: false }}
          />
          <Stack.Screen name={ROUTES.SCREEN_3} component={Screen3} />
          <Stack.Screen name={ROUTES.SCREEN_4} component={Screen4} />
          <Stack.Screen name={ROUTES.SCREEN_5} component={Screen5} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
