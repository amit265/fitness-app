import { Alert, Platform } from 'react-native';
import { getAdUnitId } from './adConfig';
import { adFrequency } from './adFrequency';

let RewardedAd: any = null;
let RewardedAdEventType: any = null;
let AdEventType: any = null;

if (Platform.OS !== 'web') {
  try {
    const mobileAds = require('react-native-google-mobile-ads');
    RewardedAd = mobileAds.RewardedAd;
    RewardedAdEventType = mobileAds.RewardedAdEventType;
    AdEventType = mobileAds.AdEventType;
  } catch (e) {
    console.warn('[rewardedAdService] Mobile ads module not available:', e);
  }
}

export interface ShowRewardedAdOptions {
  onSuccess: (silenceUntil: number) => void;
  onClosedEarly?: () => void;
  onError?: (error: any) => void;
}

/**
 * Show a user-initiated Rewarded Video Ad.
 * Section 22: Reward only after the ad is genuinely completed and SDK confirms reward.
 */
export const showRewardedAd = ({ onSuccess, onClosedEarly, onError }: ShowRewardedAdOptions): void => {
  if (Platform.OS === 'web' || !RewardedAd) {
    // Web / Dev simulation: grant 15 min silence immediately
    adFrequency.setRewardedSilenceMinutes(15).then((silenceUntil) => {
      onSuccess(silenceUntil);
    });
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
        adFrequency.setRewardedSilenceMinutes(15).then((silenceUntil) => {
          onSuccess(silenceUntil);
        });
      } else {
        if (onClosedEarly) onClosedEarly();
      }
    });

    const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (err: any) => {
      console.warn('[rewardedAdService] Rewarded Ad Error:', err);
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
      if (onError) onError(err);
    });

    rewarded.load();
  } catch (e) {
    console.warn('[rewardedAdService] Exception loading rewarded ad:', e);
    if (onError) onError(e);
  }
};
