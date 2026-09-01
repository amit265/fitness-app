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
import { ActivityIndicator, View, StyleSheet, useColorScheme, Platform } from 'react-native';
import { PALETTE } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { setupDailyEngagementNotifications } from '../services/notificationService';
import { EasUpdateModal } from '../components/EasUpdateModal';
import { useDeepLinkHandler } from '../hooks/useDeepLinkHandler';
import { AdProvider } from '../context/AdContext';
import { ThemeCustomProvider } from '../context/ThemeContext';
import { IAPProvider } from '../context/IAPContext';

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const userProfile = useAppStore((state) => state.userProfile);
  const segments = useSegments();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const isDark = useColorScheme() === 'dark';

  useDeepLinkHandler();

  useEffect(() => {
    const ensureSeededData = () => {
      const state = useAppStore.getState();
      if (!state.userProfile || state.periods.length < 2 || state.meals.length < 10) {
        state.seedMockData();
      }
      setHydrated(true);
    };

    if (useAppStore.persist.hasHydrated()) {
      ensureSeededData();
    }
    
    const unsubFinish = useAppStore.persist.onFinishHydration(() => {
      ensureSeededData();
    });
    
    setupDailyEngagementNotifications();

    return () => unsubFinish();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const isOnboarded = userProfile?.hasCompletedOnboarding === true;
    const inOnboardingSegment = segments[0] === 'onboarding';

    if (!isOnboarded && !inOnboardingSegment) {
      router.replace('/onboarding');
    } else if (isOnboarded && inOnboardingSegment) {
      router.replace('/(tabs)');
    }
  }, [hydrated, userProfile?.hasCompletedOnboarding, segments]);

  if (!hydrated) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: isDark ? PALETTE.darkBg : PALETTE.oat.bg },
        ]}
      >
        <ActivityIndicator size="large" color={PALETTE.plum.default} />
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
          { backgroundColor: isDark ? PALETTE.darkBg : PALETTE.oat.bg },
        ]}
      >
        <ActivityIndicator size="large" color={PALETTE.plum.default} />
      </View>
    );
  }

  const content = (
    <ThemeCustomProvider>
      <IAPProvider>
        <AdProvider>
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
        </AdProvider>
      </IAPProvider>
    </ThemeCustomProvider>
  );

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <EasUpdateModal />
      {Platform.OS === 'web' ? (
        <View style={styles.webOuterContainer}>
          <View style={[styles.webPhoneFrame, { backgroundColor: isDark ? PALETTE.darkBg : PALETTE.oat.bg }]}>
            {content}
          </View>
        </View>
      ) : (
        content
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#261924',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webPhoneFrame: {
    width: '100%',
    maxWidth: 480,
    height: '96%',
    maxHeight: 880,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
});
