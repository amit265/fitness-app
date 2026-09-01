import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Platform, Text, Pressable } from 'react-native';
import { useAdContext } from '../context/AdContext';
import { useAppTheme } from '../context/ThemeContext';
import { getAdUnitId } from '../constants/adConfig';
import { ExternalLink } from 'lucide-react-native';

// Dynamically import react-native-google-mobile-ads on native platforms
let BannerAd: any = null;
let BannerAdSize: any = null;
let RewardedAd: any = null;
let RewardedAdEventType: any = null;
let InterstitialAd: any = null;
let AdEventType: any = null;

if (Platform.OS !== 'web') {
  try {
    const mobileAds = require('react-native-google-mobile-ads');
    BannerAd = mobileAds.BannerAd;
    BannerAdSize = mobileAds.BannerAdSize;
    RewardedAd = mobileAds.RewardedAd;
    RewardedAdEventType = mobileAds.RewardedAdEventType;
    InterstitialAd = mobileAds.InterstitialAd;
    AdEventType = mobileAds.AdEventType;
  } catch (e) {
    console.warn('[AdManager] Mobile ads module failed to load:', e);
  }
}

// ─── 1. BANNER AD COMPONENT ──────────────────────────────────────────────────
export const BannerAdComponent: React.FC<{ style?: object }> = ({ style }) => {
  const { isAdFree } = useAdContext();
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  if (isAdFree) return null;

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
            console.warn('[AdManager] Banner Ad Failed to Load -> Error Code:', err?.code, 'Message:', err?.message || err);
            setAdError(true);
          }}
        />
      </View>
    );
  }

  // Fallback for Web or Dev placeholder
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
export const NativeAdComponent: React.FC<{ style?: object }> = ({ style }) => {
  const { isAdFree } = useAdContext();
  const { colors } = useAppTheme();

  if (isAdFree) return null;

  return (
    <View style={[styles.nativeCard, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      <View style={styles.nativeHeaderRow}>
        <View style={[styles.adBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.adBadgeText}>SPONSORED</Text>
        </View>
        <Text style={[styles.nativeTitle, { color: colors.textPrimary }]}>
          Destya Fitness & Cycle Partner
        </Text>
      </View>
      <Text style={[styles.nativeBody, { color: colors.textSecondary }]}>
        Explore cycle-synced organic nutrition, recovery tools & certified fitness gear tailored for your active phase.
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.nativeCtaBtn,
          { backgroundColor: colors.primary },
          pressed && { opacity: 0.85 },
        ]}
        onPress={() => Alert.alert('Sponsored Offer', 'Opening Destya Studio partner catalog...')}
      >
        <Text style={[styles.nativeCtaText, { color: colors.primaryText }]}>Explore Offers</Text>
        <ExternalLink color={colors.primaryText} size={12} style={{ marginLeft: 6 }} />
      </Pressable>
    </View>
  );
};

// ─── 3. INTERSTITIAL AD ──────────────────────────────────────────────────────
export const showInterstitialAd = (onComplete?: () => void) => {
  if (Platform.OS === 'web' || !InterstitialAd) {
    if (onComplete) onComplete();
    return;
  }

  try {
    const adUnitId = getAdUnitId('interstitial');
    const interstitial = InterstitialAd.createForAdRequest(adUnitId);

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitial.show();
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      if (onComplete) onComplete();
    });

    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (err: any) => {
      console.warn('[AdManager] Interstitial error:', err);
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
      if (onComplete) onComplete();
    });

    interstitial.load();
  } catch (e) {
    console.warn('[AdManager] Interstitial exception:', e);
    if (onComplete) onComplete();
  }
};

// ─── 4. REWARDED VIDEO AD WITH CONSENT & PASS UNLOCK ───────────────────────
export const showRewardedAdWithConsent = async (
  onSuccess: () => void,
  title: string = 'Watch Short Ad',
  message: string = 'Would you like to watch a short video ad to earn a 15-Minute Ad-Free Pass?'
): Promise<void> => {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Watch Ad',
      onPress: () => {
        if (Platform.OS === 'web' || !RewardedAd) {
          // On Web / Dev simulation, grant reward immediately
          onSuccess();
          return;
        }

        try {
          const adUnitId = getAdUnitId('rewarded');
          const rewarded = RewardedAd.createForAdRequest(adUnitId);
          let rewardEarned = false;

          const unsubscribeLoaded = rewarded.addAdEventListener(AdEventType.LOADED, () => {
            rewarded.show();
          });

          const unsubscribeEarned = rewarded.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            () => {
              rewardEarned = true;
            }
          );

          const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
            unsubscribeLoaded();
            unsubscribeEarned();
            unsubscribeClosed();
            if (rewardEarned) {
              onSuccess();
            } else {
              Alert.alert('Notice', 'Ad was closed early. Watch the full ad to earn the pass.');
            }
          });

          const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (err: any) => {
            console.warn('[AdManager] Rewarded Ad Error:', err);
            unsubscribeLoaded();
            unsubscribeEarned();
            unsubscribeClosed();
            unsubscribeError();
            // Fallback reward on ad load failure so user experience isn't blocked
            onSuccess();
          });

          rewarded.load();
        } catch (e) {
          console.warn('[AdManager] Rewarded Ad Exception:', e);
          onSuccess();
        }
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
