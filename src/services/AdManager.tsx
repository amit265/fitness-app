import React, { useState } from 'react';
import { View, StyleSheet, Platform, Text, Pressable } from 'react-native';
import { useAdContext } from '../context/AdContext';
import { useAppTheme } from '../context/ThemeContext';
import { ExternalLink } from 'lucide-react-native';
import { t } from '../i18n';
import { Alert } from '../utils/alertUtils';

import {
  canShowAd,
  getAdUnitId,
  ScreenName,
  showRewardedAd,
  showInterstitialAd as triggerInterstitial,
} from './ads/adService';

// Dynamically import react-native-google-mobile-ads on native platforms
let BannerAd: any = null;
let BannerAdSize: any = null;

if (Platform.OS !== 'web') {
  try {
    const mobileAds = require('react-native-google-mobile-ads');
    BannerAd = mobileAds.BannerAd;
    BannerAdSize = mobileAds.BannerAdSize;
  } catch (e) {
    console.warn('[AdManager] Mobile ads banner module failed to load:', e);
  }
}

// ─── 1. BANNER AD COMPONENT ──────────────────────────────────────────────────
export const BannerAdComponent: React.FC<{ screen?: ScreenName; style?: object }> = ({
  screen,
  style,
}) => {
  const { isPremium } = useAdContext();
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  // Check centralized eligibility rule (disabled by default on main tab screens)
  const eligible = canShowAd({ format: 'banner', screen, isPremium });
  if (!eligible) return null;

  const adUnitId = getAdUnitId('banner');

  if (Platform.OS !== 'web' && BannerAd && BannerAdSize && !adError) {
    return (
      <View style={[styles.adWrapper, style, !isAdLoaded && { height: 0, overflow: 'hidden' }]}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          onAdLoaded={() => {
            console.log('[AdManager] Banner Ad Successfully Loaded!');
            setIsAdLoaded(true);
          }}
          onAdFailedToLoad={(err: any) => {
            console.warn('[AdManager] Banner Ad Failed to Load ->', err);
            setAdError(true);
          }}
        />
      </View>
    );
  }

  // Fallback placeholder during dev testing if enabled
  return (
    <View style={[styles.adContainer, style]}>
      <View style={styles.adBadge}>
        <Text style={styles.adBadgeText}>Ad</Text>
      </View>
      <Text style={styles.adPlaceholderText}>Destya Studio Sponsored Content</Text>
    </View>
  );
};

// ─── 2. NATIVE ADVANCED / FEED BLENDED AD ──────────────────────────────────
export const NativeAdComponent: React.FC<{ screen?: ScreenName; style?: object }> = ({
  screen,
  style,
}) => {
  const { isPremium } = useAdContext();
  const { colors } = useAppTheme();
  const eligible = canShowAd({ format: 'native', screen, isPremium });
  if (!eligible) return null;

  const sponsoredLabel = t('common.sponsored');

  return (
    <View style={[styles.nativeCard, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      <View style={styles.nativeHeaderRow}>
        <View style={[styles.adBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.adBadgeText}>{sponsoredLabel}</Text>
        </View>
        <Text style={[styles.nativeTitle, { color: colors.textPrimary }]}>
          {t('ads.partnerTitle')}
        </Text>
      </View>
      <Text style={[styles.nativeBody, { color: colors.textSecondary }]}>
        {t('ads.partnerBody')}
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.nativeCtaBtn,
          { backgroundColor: colors.primary },
          pressed && { opacity: 0.85 },
        ]}
        onPress={() => Alert.alert(t('common.sponsored'), t('ads.partnerBody'))}
      >
        <Text style={[styles.nativeCtaText, { color: colors.primaryText }]}>{t('ads.explore')}</Text>
        <ExternalLink color={colors.primaryText} size={12} style={{ marginLeft: 6 }} />
      </Pressable>
    </View>
  );
};

// ─── 3. INTERSTITIAL AD ──────────────────────────────────────────────────────
export const showInterstitialAd = (
  screen: ScreenName = 'home',
  isPremium: boolean = false,
  onComplete?: () => void
) => {
  triggerInterstitial({ screen, isPremium, onComplete });
};

// ─── 4. REWARDED VIDEO AD WITH CONSENT & PASS UNLOCK ───────────────────────
export const showRewardedAdWithConsent = async (
  onSuccess: (silenceUntil: number) => void,
  title: string = 'Want fewer interruptions?',
  message: string = 'Watch a short video ad to silence pop-up ads for 15 minutes.'
): Promise<void> => {
  Alert.alert(title, message, [
    { text: 'Not now', style: 'cancel' },
    {
      text: 'Watch Ads',
      onPress: () => {
        showRewardedAd({
          onSuccess: (silenceUntil) => {
            Alert.alert(
              '15-Minute Quiet Pass Activated ⏱️',
              'Pop-up ads are now silenced for the next 15 minutes.'
            );
            onSuccess(silenceUntil);
          },
          onClosedEarly: () => {
            Alert.alert(
              'Ad Closed Early',
              'Watch the full ad to grant 15 minutes of quiet time.'
            );
          },
          onError: () => {
            Alert.alert(
              'Ad Unavailable',
              'Ad could not be loaded. Please try again later.'
            );
          },
        });
      },
    },
  ]);
};

const styles = StyleSheet.create({
  adWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  adContainer: {
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  adBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  adBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  adPlaceholderText: {
    fontSize: 12,
    color: '#8D8070',
    fontFamily: 'Outfit-Medium',
  },
  nativeCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FAF8F5',
    borderWidth: 1.5,
    borderColor: '#ECE9E4',
    marginVertical: 12,
  },
  nativeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  nativeTitle: {
    fontSize: 14,
    fontFamily: 'Outfit-Bold',
    color: '#2C2825',
  },
  nativeBody: {
    fontSize: 12,
    color: '#6B6256',
    lineHeight: 16,
    marginBottom: 10,
  },
  nativeCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#132F94',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
  },
  nativeCtaText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
  },
});
