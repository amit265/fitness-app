import React from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { useAdContext } from '../context/AdContext';

// Native placeholder layout banner container matching Destya Studio Guidelines Section 13C
export const BannerAdComponent: React.FC<{ style?: object }> = ({ style }) => {
  const { isAdFree } = useAdContext();

  if (isAdFree) return null;

  return (
    <View style={[styles.adContainer, style]}>
      <View style={styles.adBadge}>
        <Text style={styles.adBadgeText}>Ad</Text>
      </View>
      <Text style={styles.adPlaceholderText}>Destya Studio Sponsored Content</Text>
    </View>
  );
};

// Mandatory User Consent dialog before showing Rewarded Ad (Section 13B)
export const showRewardedAdWithConsent = async (
  onSuccess: () => void,
  title: string = 'Watch Short Ad',
  message: string = 'Would you like to watch a short video ad to earn 1-Hour Ad-Free coaching?'
): Promise<void> => {
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
});
