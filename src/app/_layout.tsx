import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { Stack, useSegments, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet, useColorScheme } from 'react-native';
import { PALETTE } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const userProfile = useAppStore((state) => state.userProfile);
  const segments = useSegments();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const isDark = useColorScheme() === 'dark';

  useEffect(() => {
    // Check if already hydrated
    if (useAppStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    
    const unsubFinish = useAppStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    
    return () => unsubFinish();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const isOnboarded = userProfile?.hasCompletedOnboarding === true;
    const inOnboardingSegment = segments[0] === 'onboarding';

    if (!isOnboarded && !inOnboardingSegment) {
      // Redirect to onboarding
      router.replace('/onboarding');
    } else if (isOnboarded && inOnboardingSegment) {
      // Redirect to tabs
      router.replace('/(tabs)');
    }
  }, [hydrated, userProfile?.hasCompletedOnboarding, segments]);

  if (!hydrated) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: isDark ? '#121110' : PALETTE.cream },
        ]}
      >
        <ActivityIndicator size="large" color={PALETTE.sage.default} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [fontsLoaded, fontError] = useFonts({
    'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
    'PlayfairDisplay-Medium': PlayfairDisplay_500Medium,
    'PlayfairDisplay-SemiBold': PlayfairDisplay_600SemiBold,
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
    'Outfit-Light': Outfit_300Light,
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-Bold': Outfit_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: isDark ? '#121110' : PALETTE.cream },
        ]}
      >
        <ActivityIndicator size="large" color={PALETTE.sage.default} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="bmi" options={{ headerShown: false }} />
          <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
          <Stack.Screen name="cycle" options={{ headerShown: false }} />
        </Stack>
      </NavigationGuard>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
