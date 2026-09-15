import '@react-native-firebase/app';
import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import {
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
} from '@expo-google-fonts/urbanist';
import { Stack, useSegments, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet, useColorScheme, Platform, Animated, LogBox, Pressable, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { PALETTE } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { setupDailyEngagementNotifications } from '../services/notificationService';
import { EasUpdateModal } from '../components/EasUpdateModal';
import { useDeepLinkHandler } from '../hooks/useDeepLinkHandler';
import { requestUserPermission, initializeMessaging } from '../services/firebase/messagingService';
import { ThemeCustomProvider, useAppTheme } from '../context/ThemeContext';
import { IAPProvider } from '../context/IAPContext';
import { SplashScreenComponent } from '../components/SplashScreenComponent';
import { ThemedAlert } from '../components/ThemedAlert';

// Keep native splash screen visible while app resources initialize
void SplashScreen.preventAutoHideAsync();

// Ignore harmless React Navigation back button warnings on Android
LogBox.ignoreLogs([
  "The screen '(tabs)' was removed natively",
]);

import { initAppLanguage } from '../i18n';

function NavigationGuard({
  children,
  onHydrated,
}: {
  children: React.ReactNode;
  onHydrated: () => void;
}) {
  const userProfile = useAppStore((state) => state.userProfile);
  const segments = useSegments();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useDeepLinkHandler();

  useEffect(() => {
    const ensureSeededData = async () => {
      const state = useAppStore.getState();
      if (!state.userProfile || state.periods.length < 2 || state.meals.length < 10) {
        state.seedMockData();
      }
      await initAppLanguage();
      setHydrated(true);
      onHydrated();
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

  return <>{children}</>;
}

function AppSystemUI() {
  const { colors } = useAppTheme();

  return (
    <StatusBar
      style={colors.statusBar.content}
      animated
    />
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [hydrated, setHydrated] = useState(false);
  const [showAppSplash, setShowAppSplash] = useState(true);
  const [hasHiddenNativeSplash, setHasHiddenNativeSplash] = useState(false);
  const [splashOpacity] = useState(() => new Animated.Value(1));
  const [webFrameMode, setWebFrameMode] = useState<'phone' | 'ipad'>('phone');

  const [fontsLoaded, fontError] = useFonts({
    'Urbanist-Regular': Urbanist_400Regular,
    'Urbanist-Medium': Urbanist_500Medium,
    'Urbanist-SemiBold': Urbanist_600SemiBold,
    'Urbanist-Bold': Urbanist_700Bold,
  });

  const isAppReady = (fontsLoaded || Boolean(fontError)) && hydrated;

  // 1. Hide native splash screen once fonts and store hydration finish, and init Firebase
  useEffect(() => {
    if (isAppReady && !hasHiddenNativeSplash) {
      const initApp = async () => {
        setHasHiddenNativeSplash(true);
        try {
          await SplashScreen.hideAsync();
          
          // Initialize Firebase Services
          await requestUserPermission();
        } catch (e) {
          console.warn('Failed to init app during splash hide:', e);
        }
      };
      initApp();
      
      const unsubMessaging = initializeMessaging();
      return () => unsubMessaging();
    }
  }, [isAppReady, hasHiddenNativeSplash]);

  // 2. Smoothly fade out custom splash overlay after coin spin & text animation completes
  useEffect(() => {
    if (isAppReady && hasHiddenNativeSplash) {
      const fadeTimer = setTimeout(() => {
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start(() => setShowAppSplash(false));
      }, 2400);

      return () => clearTimeout(fadeTimer);
    }
  }, [isAppReady, hasHiddenNativeSplash, splashOpacity]);

  const content = (
    <ThemeCustomProvider>
      <AppSystemUI />
      <IAPProvider>
        <NavigationGuard onHydrated={() => setHydrated(true)}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="bmi" options={{ headerShown: false }} />
            <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
            <Stack.Screen name="cycle" options={{ headerShown: false }} />
            <Stack.Screen name="logModal" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="workoutDetailModal" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="nutritionDetailModal" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>

          {/* Custom Animated Splash Screen Overlay */}
          {showAppSplash && (
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: splashOpacity, zIndex: 99999 }]}>
              <SplashScreenComponent showBranding={true} startAnimation={hasHiddenNativeSplash} />
            </Animated.View>
          )}
          
          {/* Global Themed Alert */}
          <ThemedAlert />
        </NavigationGuard>
      </IAPProvider>
    </ThemeCustomProvider>
  );

  return (
    <SafeAreaProvider>
      <EasUpdateModal />
      {Platform.OS === 'web' ? (
        <View style={styles.webOuterContainer}>
          <View style={styles.webToggleContainer}>
            <Pressable
              style={[styles.webToggleBtn, webFrameMode === 'phone' && styles.webToggleBtnActive]}
              onPress={() => setWebFrameMode('phone')}
            >
              <Text style={[styles.webToggleText, webFrameMode === 'phone' && styles.webToggleTextActive]}>Phone Size</Text>
            </Pressable>
            <Pressable
              style={[styles.webToggleBtn, webFrameMode === 'ipad' && styles.webToggleBtnActive]}
              onPress={() => setWebFrameMode('ipad')}
            >
              <Text style={[styles.webToggleText, webFrameMode === 'ipad' && styles.webToggleTextActive]}>iPad Size</Text>
            </Pressable>
          </View>
          <View 
            nativeID="web-modal-root" 
            style={[styles.webPhoneFrame, { position: 'relative', backgroundColor: isDark ? PALETTE.darkBg : PALETTE.oat.bg, maxWidth: webFrameMode === 'phone' ? 480 : 820 }]}
          >
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
  webToggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 6,
    borderRadius: 30,
    gap: 8,
  },
  webToggleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  webToggleBtnActive: {
    backgroundColor: '#FF6B6B', // Destya primary red/coral
  },
  webToggleText: {
    color: '#rgba(255,255,255,0.6)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 14,
  },
  webToggleTextActive: {
    color: '#fff',
    fontFamily: 'Urbanist-Bold',
  },
});
