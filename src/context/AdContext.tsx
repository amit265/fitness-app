import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAdService, adFrequency } from '../services/ads/adService';

interface AdContextType {
  isAdFree: boolean; // True if Premium OR Rewarded Silence active
  isPremium: boolean;
  adFreeExpiresAt: number | null;
  grantAdFreeHours: (hours: number) => Promise<void>;
  grantAdFreeMinutes: (minutes: number) => Promise<void>;
  grant15MinRewardedSilence: () => Promise<number>;
  setPremiumStatus: (status: boolean) => Promise<void>;
  checkAdFreeStatus: () => Promise<boolean>;
}

const AD_FREE_UNTIL_KEY = 'ds_ad_free_until_timestamp';
const IS_PREMIUM_KEY = 'ds_is_premium_user';

const AdContext = createContext<AdContextType>({
  isAdFree: false,
  isPremium: false,
  adFreeExpiresAt: null,
  grantAdFreeHours: async () => {},
  grantAdFreeMinutes: async () => {},
  grant15MinRewardedSilence: async () => 0,
  setPremiumStatus: async () => {},
  checkAdFreeStatus: async () => false,
});

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdFree, setIsAdFree] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [adFreeExpiresAt, setAdFreeExpiresAt] = useState<number | null>(null);

  const checkAdFreeStatus = async (): Promise<boolean> => {
    try {
      const isPremiumVal = await AsyncStorage.getItem(IS_PREMIUM_KEY);
      if (isPremiumVal === 'true') {
        setIsPremium(true);
        setIsAdFree(true);
        setAdFreeExpiresAt(null);
        return true;
      }

      setIsPremium(false);

      const adFreeUntilStr = await AsyncStorage.getItem(AD_FREE_UNTIL_KEY);
      if (adFreeUntilStr) {
        const untilTime = parseInt(adFreeUntilStr, 10);
        if (untilTime > Date.now()) {
          setIsAdFree(true);
          setAdFreeExpiresAt(untilTime);
          return true;
        }
      }

      setIsAdFree(false);
      setAdFreeExpiresAt(null);
      return false;
    } catch (e) {
      setIsPremium(false);
      setIsAdFree(false);
      setAdFreeExpiresAt(null);
      return false;
    }
  };

  const grantAdFreeHours = async (hours: number) => {
    try {
      const futureTime = await adFrequency.setRewardedSilenceMinutes(hours * 60);
      await AsyncStorage.setItem(AD_FREE_UNTIL_KEY, futureTime.toString());
      setIsAdFree(true);
      setAdFreeExpiresAt(futureTime);
    } catch (e) {
      console.warn('[AdContext] Error granting ad free hours:', e);
    }
  };

  const grantAdFreeMinutes = async (minutes: number) => {
    try {
      const futureTime = await adFrequency.setRewardedSilenceMinutes(minutes);
      await AsyncStorage.setItem(AD_FREE_UNTIL_KEY, futureTime.toString());
      setIsAdFree(true);
      setAdFreeExpiresAt(futureTime);
    } catch (e) {
      console.warn('[AdContext] Error granting ad free minutes:', e);
    }
  };

  const grant15MinRewardedSilence = async (): Promise<number> => {
    const futureTime = await adFrequency.setRewardedSilenceMinutes(15);
    try {
      await AsyncStorage.setItem(AD_FREE_UNTIL_KEY, futureTime.toString());
    } catch (e) {
      console.warn('[AdContext] Error storing rewarded silence timestamp:', e);
    }
    setIsAdFree(true);
    setAdFreeExpiresAt(futureTime);
    return futureTime;
  };

  const setPremiumStatus = async (status: boolean) => {
    try {
      await AsyncStorage.setItem(IS_PREMIUM_KEY, status ? 'true' : 'false');
      setIsPremium(status);
      setIsAdFree(status);
      setAdFreeExpiresAt(null);
    } catch (e) {
      console.warn('[AdContext] Error setting premium status:', e);
    }
  };

  useEffect(() => {
    initializeAdService().then(() => {
      checkAdFreeStatus();
    });

    if (Platform.OS !== 'web') {
      try {
        const mobileAds = require('react-native-google-mobile-ads').default;
        if (mobileAds) {
          mobileAds()
            .initialize()
            .then((adapterStatuses: any) => {
              console.log('[AdContext] Google Mobile Ads SDK Initialized Successfully:', adapterStatuses);
            })
            .catch((err: any) => {
              console.warn('[AdContext] Google Mobile Ads SDK Init Error:', err);
            });
        }
      } catch (e) {
        console.warn('[AdContext] Google Mobile Ads module not loaded (Expo Go / Web):', e);
      }
    }
  }, []);

  return (
    <AdContext.Provider
      value={{
        isAdFree,
        isPremium,
        adFreeExpiresAt,
        grantAdFreeHours,
        grantAdFreeMinutes,
        grant15MinRewardedSilence,
        setPremiumStatus,
        checkAdFreeStatus,
      }}
    >
      {children}
    </AdContext.Provider>
  );
};

export const useAdContext = () => useContext(AdContext);
