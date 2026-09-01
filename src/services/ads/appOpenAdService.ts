import { Platform } from 'react-native';
import { getAdUnitId } from './adConfig';
import { canShowAd } from './adEligibility';
import { adFrequency } from './adFrequency';

let AppOpenAd: any = null;
let AdEventType: any = null;

if (Platform.OS !== 'web') {
  try {
    const mobileAds = require('react-native-google-mobile-ads');
    AppOpenAd = mobileAds.AppOpenAd;
    AdEventType = mobileAds.AdEventType;
  } catch (e) {
    console.warn('[appOpenAdService] Mobile ads module not loaded:', e);
  }
}

/**
 * Attempt to display an App Open ad on app warm start if eligible.
 * Never blocks app startup or navigation if not ready.
 */
export const tryShowAppOpenAd = (isPremium: boolean): void => {
  const eligible = canShowAd({ format: 'appOpen', isPremium });

  if (!eligible || Platform.OS === 'web' || !AppOpenAd) {
    return;
  }

  try {
    const adUnitId = getAdUnitId('appOpen');
    const appOpenAd = AppOpenAd.createForAdRequest(adUnitId);

    const unsubscribeLoaded = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      adFrequency.recordAppOpenShown();
      appOpenAd.show();
    });

    const unsubscribeError = appOpenAd.addAdEventListener(AdEventType.ERROR, (err: any) => {
      console.warn('[appOpenAdService] App Open ad failed silently:', err);
      unsubscribeLoaded();
      unsubscribeError();
    });

    appOpenAd.load();
  } catch (e) {
    console.warn('[appOpenAdService] Exception loading App Open ad:', e);
  }
};
