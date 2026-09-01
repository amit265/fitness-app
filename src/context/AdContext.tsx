import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AdContextType {
  isAdFree: boolean;
  adFreeExpiresAt: number | null;
  grantAdFreeHours: (hours: number) => Promise<void>;
  setPremiumStatus: (status: boolean) => Promise<void>;
  checkAdFreeStatus: () => Promise<boolean>;
}

const AD_FREE_UNTIL_KEY = 'ds_ad_free_until_timestamp';
const IS_PREMIUM_KEY = 'ds_is_premium_user';

const AdContext = createContext<AdContextType>({
  isAdFree: false,
  adFreeExpiresAt: null,
  grantAdFreeHours: async () => {},
  setPremiumStatus: async () => {},
  checkAdFreeStatus: async () => false,
});

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdFree, setIsAdFree] = useState(false);
  const [adFreeExpiresAt, setAdFreeExpiresAt] = useState<number | null>(null);

  const checkAdFreeStatus = async (): Promise<boolean> => {
    try {
      const isPremium = await AsyncStorage.getItem(IS_PREMIUM_KEY);
      if (isPremium === 'true') {
        setIsAdFree(true);
        setAdFreeExpiresAt(null);
        return true;
      }

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
      setIsAdFree(false);
      setAdFreeExpiresAt(null);
      return false;
    }
  };

  const grantAdFreeHours = async (hours: number) => {
    try {
      const futureTime = Date.now() + hours * 60 * 60 * 1000;
      await AsyncStorage.setItem(AD_FREE_UNTIL_KEY, futureTime.toString());
      setIsAdFree(true);
      setAdFreeExpiresAt(futureTime);
    } catch (e) {
      console.warn('[AdContext] Error granting ad free hours:', e);
    }
  };

  const setPremiumStatus = async (status: boolean) => {
    try {
      await AsyncStorage.setItem(IS_PREMIUM_KEY, status ? 'true' : 'false');
      setIsAdFree(status);
      setAdFreeExpiresAt(null);
    } catch (e) {
      console.warn('[AdContext] Error setting premium status:', e);
    }
  };

  useEffect(() => {
    checkAdFreeStatus();
  }, []);

  return (
    <AdContext.Provider
      value={{
        isAdFree,
        adFreeExpiresAt,
        grantAdFreeHours,
        setPremiumStatus,
        checkAdFreeStatus,
      }}
    >
      {children}
    </AdContext.Provider>
  );
};

export const useAdContext = () => useContext(AdContext);
