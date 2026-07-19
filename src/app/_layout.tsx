import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from '@/auth/AuthContext';
import { WorldProvider } from '@/theme/world-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <WorldProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="recipe/[id]" />
            <Stack.Screen name="guide/[id]" options={{ gestureEnabled: false }} />
            <Stack.Screen name="account" options={{ presentation: 'modal' }} />
          </Stack>
        </WorldProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
