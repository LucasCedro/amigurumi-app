import {
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  useFonts,
} from '@expo-google-fonts/baloo-2';
import {
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from '@/auth/AuthContext';
import { LocaleProvider } from '@/i18n/LocaleContext';
import '@/i18n';
import { CatalogProvider } from '@/state/catalog';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';
import { typeface } from '@/theme/tokens';

function ThemedStatusBar() {
  const { theme } = useTheme();
  return <StatusBar style={theme.isDark ? 'light' : 'dark'} />;
}

// Fonte padrão global: tudo que não define fontFamily herda a Quicksand.
function applyDefaultFont() {
  const anyText = Text as unknown as { defaultProps?: Record<string, unknown> };
  const anyInput = TextInput as unknown as { defaultProps?: Record<string, unknown> };
  anyText.defaultProps = anyText.defaultProps ?? {};
  anyText.defaultProps.style = [{ fontFamily: typeface.body }, anyText.defaultProps.style];
  anyInput.defaultProps = anyInput.defaultProps ?? {};
  anyInput.defaultProps.style = [{ fontFamily: typeface.body }, anyInput.defaultProps.style];
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  useEffect(() => {
    if (loaded) applyDefaultFont();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <LocaleProvider>
          <AuthProvider>
            <CatalogProvider>
              <ThemedStatusBar />
              <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="recipe/[id]" />
                <Stack.Screen name="guide/[id]" options={{ gestureEnabled: false }} />
                <Stack.Screen name="account" options={{ presentation: 'modal' }} />
                <Stack.Screen name="admin" />
              </Stack>
            </CatalogProvider>
          </AuthProvider>
        </LocaleProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
