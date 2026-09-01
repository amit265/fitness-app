import { AD_CONFIG, AdFormatType } from './adConfig';
import { isAdAllowedOnScreen, ScreenName } from './adPolicy';
import { adFrequency } from './adFrequency';

export interface AdEligibilityParams {
  format: AdFormatType;
  screen?: ScreenName;
  isPremium: boolean;
}

/**
 * Single centralized eligibility check as defined in Section 6 of the spec.
 * Conceptually:
 * Premium? -> YES -> NO ADS
 * Rewarded silence active? -> YES -> NO POP-UP ADS (Interstitial/AppOpen)
 * Normal ad policy & frequency rules apply.
 */
export const canShowAd = ({ format, screen, isPremium }: AdEligibilityParams): boolean => {
  // 1. Premium users get ZERO ads under any format or screen
  if (isPremium) {
    return false;
  }

  // 2. Format specific checks
  switch (format) {
    case 'banner':
      if (!AD_CONFIG.banner.enabled) return false;
      return isAdAllowedOnScreen('banner', screen);

    case 'native':
      if (!AD_CONFIG.native.enabled) return false;
      return isAdAllowedOnScreen('native', screen);

    case 'interstitial':
      if (!AD_CONFIG.interstitial.enabled) return false;
      if (adFrequency.isRewardedSilenceActive()) return false;
      if (!isAdAllowedOnScreen('interstitial', screen)) return false;
      return adFrequency.canShowInterstitial();

    case 'appOpen':
      if (!AD_CONFIG.appOpen.enabled) return false;
      if (adFrequency.isRewardedSilenceActive()) return false;
      return adFrequency.canShowAppOpen();

    case 'rewarded':
      if (!AD_CONFIG.rewarded.enabled) return false;
      return isAdAllowedOnScreen('rewarded', screen);

    default:
      return false;
  }
};
