import { Platform } from 'react-native';
import { getAdUnitId } from './adConfig';
import { canShowAd } from './adEligibility';
import { adFrequency } from './adFrequency';
import { ScreenName } from './adPolicy';

let InterstitialAd: any = null;
let AdEventType: any = null;

if (Platform.OS !== 'web') {
  try {
    const mobileAds = require('react-native-google-mobile-ads');
    InterstitialAd = mobileAds.InterstitialAd;
    AdEventType = mobileAds.AdEventType;
  } catch (e) {
    console.warn('[interstitialAdService] Mobile ads module not loaded:', e);
  }
}

export interface ShowInterstitialOptions {
  screen: ScreenName;
  isPremium: boolean;
  onComplete?: () => void;
}

/**
 * Show Interstitial Ad at natural transitions if eligible according to global policy & cooldowns.
 */
export const showInterstitialAd = ({ screen, isPremium, onComplete }: ShowInterstitialOptions): void => {
  const eligible = canShowAd({ format: 'interstitial', screen, isPremium });

  if (!eligible || Platform.OS === 'web' || !InterstitialAd) {
    if (onComplete) onComplete();
    return;
  }

  try {
    const adUnitId = getAdUnitId('interstitial');
    const interstitial = InterstitialAd.createForAdRequest(adUnitId);

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      adFrequency.recordInterstitialShown();
      interstitial.show();
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      if (onComplete) onComplete();
    });

    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (err: any) => {
      console.warn('[interstitialAdService] Interstitial error:', err);
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
      if (onComplete) onComplete();
    });

    interstitial.load();
  } catch (e) {
    console.warn('[interstitialAdService] Exception playing interstitial ad:', e);
    if (onComplete) onComplete();
  }
};
