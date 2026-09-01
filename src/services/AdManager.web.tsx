import React from 'react';
import { View } from 'react-native';

// Web mock component returning null
export const BannerAdComponent: React.FC<{ style?: object }> = () => {
  return null;
};

export const showRewardedAdWithConsent = async (
  onSuccess: () => void,
  title: string = 'Watch Short Ad',
  message: string = 'Would you like to watch a short ad to earn 1-Hour Ad-Free access?'
): Promise<void> => {
  // Web mock auto-grants success in web preview mode
  onSuccess();
};
