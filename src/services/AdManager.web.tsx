import React from 'react';

// Web mock banner component returning null
export const BannerAdComponent: React.FC<{ style?: object }> = () => {
  return null;
};

// Web mock native ad component returning null
export const NativeAdComponent: React.FC<{ style?: object }> = () => {
  return null;
};

export const showInterstitialAd = (onComplete?: () => void) => {
  if (onComplete) onComplete();
};

export const showRewardedAdWithConsent = async (
  onSuccess: () => void,
  title: string = 'Watch Short Ad',
  message: string = 'Would you like to watch a short ad to earn 1-Hour Ad-Free access?'
): Promise<void> => {
  onSuccess();
};
