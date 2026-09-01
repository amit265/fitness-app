import React from 'react';
import { View, StyleSheet, Alert, Text, Pressable } from 'react-native';
import { useAdContext } from '../context/AdContext';
import { ExternalLink } from 'lucide-react-native';
import { getAdUnitId } from '../constants/adConfig';

// 1. Banner Ad Component
export const BannerAdComponent: React.FC<{ style?: object }> = ({ style }) => {
  const { isAdFree } = useAdContext();

  if (isAdFree) return null;

  // Selected Ad Unit ID (Test ID in __DEV__, Real ID in production)
  const adUnitId = getAdUnitId('banner');

  return (
    <View style={[styles.adContainer, style]}>
      <View style={styles.adBadge}>
        <Text style={styles.adBadgeText}>Ad</Text>
      </View>
      <Text style={styles.adPlaceholderText}>Destya Studio Sponsored Content</Text>
    </View>
  );
};

// 2. Native Advanced Ad Component (Blended Feed Card - Destya Mobile Standards)
export const NativeAdComponent: React.FC<{ style?: object }> = ({ style }) => {
  const { isAdFree } = useAdContext();

  if (isAdFree) return null;

  return (
    <View style={[styles.nativeCard, style]}>
      <View style={styles.nativeHeaderRow}>
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>Ad</Text>
        </View>
        <Text style={styles.nativeTitle}>Destya Fitness Partner & Recommendations</Text>
      </View>
      <Text style={styles.nativeBody}>
        Explore cycle-syncing organic supplements, mindfulness tools & certified fitness gear.
      </Text>
      <Pressable
        style={styles.nativeCtaBtn}
        onPress={() => Alert.alert('Sponsored Link', 'Opening partner offer...')}
      >
        <Text style={styles.nativeCtaText}>Explore Offers</Text>
        <ExternalLink color="#FFFFFF" size={12} style={{ marginLeft: 4 }} />
      </Pressable>
    </View>
  );
};

// 3. Interstitial Ad (Natural Transition Points)
export const showInterstitialAd = (onComplete?: () => void) => {
  const adUnitId = getAdUnitId('interstitial');
  // Graceful simulation or execution in dev / prod
  if (onComplete) {
    onComplete();
  }
};

// 4. Rewarded Video Ad with Mandatory User Consent
export const showRewardedAdWithConsent = async (
  onSuccess: () => void,
  title: string = 'Watch Short Ad',
  message: string = 'Would you like to watch a short video ad to earn 1-Hour Ad-Free coaching?'
): Promise<void> => {
  const adUnitId = getAdUnitId('rewarded');

  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Watch Ad',
      onPress: () => {
        // Grant reward
        onSuccess();
      },
    },
  ]);
};

const styles = StyleSheet.create({
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
