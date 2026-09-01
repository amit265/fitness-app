import React from 'react';

// Web mock banner component returning null
export const BannerAdComponent: React.FC<{ screen?: string; style?: object }> = () => {
  return null;
};

// Web mock native ad component returning null
export const NativeAdComponent: React.FC<{ screen?: string; style?: object }> = () => {
  return null;
};

export const showInterstitialAd = (
  screen: string = 'home',
  isPremium: boolean = false,
  onComplete?: () => void
) => {
  if (onComplete) onComplete();
};

export const showRewardedAdWithConsent = async (
  onSuccess: (silenceUntil: number) => void,
  title: string = 'Want fewer interruptions?',
  message: string = 'Watch a short video ad to silence pop-up ads for 15 minutes.'
): Promise<void> => {
  const silenceUntil = Date.now() + 15 * 60 * 1000;
  onSuccess(silenceUntil);
};
