import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSupabaseAuthStore } from '@/store/useSupabaseAuthStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { user, loading, hydrate } = useAuthStore();
  const { session, loading: sLoading, hydrate: sHydrate } = useSupabaseAuthStore();

  useEffect(() => {
    hydrate();
    sHydrate();
  }, []);

  useEffect(() => {
    if (loading || sLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const authed = !!session || !!user;
    if (!authed && !inAuthGroup) router.replace('/(auth)/login');
    if (authed && inAuthGroup) router.replace('/');
  }, [segments, user, loading, session, sLoading]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(modals)/add-transaction" options={{ presentation: 'modal', title: '记一笔' }} />
        <Stack.Screen name="history/[date]" options={{ title: '历史流水' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
