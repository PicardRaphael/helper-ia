import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { initializeI18n } from '@/i18n';
import { useColorScheme } from '@/hooks/use-color-scheme';

void SplashScreen.preventAutoHideAsync().catch(() => null);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const prepare = async () => {
      try {
        await initializeI18n();
      } catch (error) {
        console.error('RootLayout: i18n initialization failed', error);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    void prepare();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isReady) {
      void SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name='index' options={{ headerShown: false }} />
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen name='generated' options={{ headerShown: false }} />
        <Stack.Screen
          name='legal'
          options={{ headerShown: false }}
        />
        <Stack.Screen name='modal' options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style='auto' />
    </ThemeProvider>
  );
}
