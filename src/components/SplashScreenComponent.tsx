import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Image,
  Text,
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { PALETTE } from '../constants/theme';
import { t } from '../i18n';

interface SplashScreenComponentProps {
  showBranding?: boolean;
  startAnimation?: boolean;
}

export function SplashScreenComponent({
  showBranding = true,
  startAnimation = true,
}: SplashScreenComponentProps) {
  const { colors, isDark } = useAppTheme();

  // --- Animation Controllers ---
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.85)).current;
  const coinSpin = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(24)).current;
  const brandingOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!startAnimation) return;

    // 1. Icon Fade & Scale
    Animated.parallel([
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: 1.0,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Continuous 2D Cycle Rotation
    Animated.loop(
      Animated.timing(coinSpin, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 3. Text Slide Up & Fade In
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        delay: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 800,
        delay: 350,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
    ]).start();

    // 4. Footer Branding Fade In
    Animated.timing(brandingOpacity, {
      toValue: 1,
      duration: 900,
      delay: 550,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [startAnimation]);

  const spin = coinSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Background Ambient Glows */}
      <View
        style={[
          styles.glowTop,
          {
            backgroundColor: isDark
              ? 'rgba(217, 147, 158, 0.08)'
              : 'rgba(59, 41, 56, 0.06)',
          },
        ]}
      />
      <View
        style={[
          styles.glowBottom,
          {
            backgroundColor: isDark
              ? 'rgba(143, 168, 154, 0.08)'
              : 'rgba(201, 120, 97, 0.06)',
          },
        ]}
      />

      {showBranding && (
        <>
          {/* Main Logo & Title Centerpiece */}
          <View style={styles.centerContainer}>
            <Animated.View
              style={[
                styles.logoCircleWrapper,
                {
                  opacity: iconOpacity,
                  transform: [{ scale: iconScale }, { rotate: spin }],
                },
              ]}
            >
              <Image
                source={require('../../assets/splash-icon.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </Animated.View>

            <Animated.View
              style={{
                alignItems: 'center',
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              }}
            >
              <Text style={[styles.appNameText, { color: colors.textPrimary }]}>
                Sini
              </Text>
              <Text style={[styles.appTaglineText, { color: colors.primary }]}>
                {t('common.tagline')}
              </Text>
            </Animated.View>
          </View>

          {/* Footer Branding */}
          <Animated.View
            style={[styles.footerContainer, { opacity: brandingOpacity }]}
          >
            <Text style={[styles.brandingText, { color: colors.textSecondary }]}>
              DESTYA STUDIO
            </Text>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    // Note: intentionally no overflow:hidden — it was clipping wide letter-spaced
    // text (DESTYA STUDIO) during the font-metrics race condition on first render
    zIndex: 99999,
  },
  glowTop: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -110,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircleWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appNameText: {
    marginTop: 22,
    fontSize: 28,
    fontFamily: 'Urbanist-Bold',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  appTaglineText: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: 'Urbanist-Medium',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  brandingText: {
    fontSize: 11,
    fontFamily: 'Urbanist-Bold',
    letterSpacing: 1.5,
    textAlign: 'center',
    // Explicit width ensures text is never constrained by an undefined parent width
    width: '100%',
  },
});
