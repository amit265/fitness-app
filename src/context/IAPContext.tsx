import { useAppStore } from "../store/useAppStore";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { Alert } from '../utils/alertUtils';


// Platform-isolated import to prevent web bundler crashes
let RNIap: any;
if (Platform.OS !== 'web') {
  try {
    RNIap = require('react-native-iap');
  } catch (e) {
    console.warn('[IAP] react-native-iap failed to load on native', e);
  }
}

interface IAPContextType {
  isPremium: boolean;
  premiumProduct: any | null;
  isLoading: boolean;
  requestPurchase: () => Promise<void>;
  restorePurchases: () => Promise<{ success: boolean; message: string }>;
}

const IAPContext = createContext<IAPContextType>({
  isPremium: false,
  premiumProduct: null,
  isLoading: false,
  requestPurchase: async () => { },
  restorePurchases: async () => ({ success: false, message: '' }),
});

export const PREMIUM_PRODUCT_ID = 'com.destyastudio.sini.premium';
const LOCAL_PREMIUM_KEY = 'isPremium';

export const IAPProvider = ({ children }: { children: ReactNode }) => {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [premiumProduct, setPremiumProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Layer 1: Sync to local storage & read on mount
  useEffect(() => {
    const loadStoredPremiumStatus = async () => {
      try {
        const stored = await AsyncStorage.getItem(LOCAL_PREMIUM_KEY);
        if (stored === 'true') {
          setIsPremium(true);
        }
      } catch (e) {
        console.warn('[IAP] Failed to load local premium status:', e);
      }
    };
    loadStoredPremiumStatus();
  }, []);

  // Initialize RNIap on native platforms
  useEffect(() => {
    if (Platform.OS === 'web' || !RNIap) return;

    let purchaseUpdateSubscription: any;
    let purchaseErrorSubscription: any;

    const initIAP = async () => {
      try {
        await RNIap.initConnection();
        console.log('[IAP] Connection initialized successfully.');

        // Fetch products
        const products = await RNIap.fetchProducts({ skus: [PREMIUM_PRODUCT_ID] });
        if (products && products.length > 0) {
          setPremiumProduct(products[0]);
          console.log('[IAP] Retrieved products:', products);
        }

        // Set up Purchase Listeners
        purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase: any) => {
          const receipt = purchase.transactionReceipt || purchase.purchaseToken || purchase.receipt;
          if (receipt) {
            try {
              // Finish transaction properly across iOS and Android
              await RNIap.finishTransaction({ purchase, isConsumable: false });

              // Save premium status locally
              await AsyncStorage.setItem(LOCAL_PREMIUM_KEY, 'true');
              setIsPremium(true);
              useAppStore.getState().showAlert('Thank You!', 'Your purchase was successful! You are now a Premium Supporter.');
            } catch (err) {
              console.warn('[IAP] Error acknowledging purchase:', err);
            }
          }
        });

        purchaseErrorSubscription = RNIap.purchaseErrorListener((error: any) => {
          console.warn('[IAP] Purchase error:', error);
          if (error?.code !== 'E_USER_CANCELLED') {
            useAppStore.getState().showAlert('Purchase Error', error?.message || 'Something went wrong during the purchase.');
          }
        });
      } catch (err) {
        console.warn('[IAP] Failed to initialize connection or fetch products:', err);
      }
    };

    initIAP();

    return () => {
      if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
      if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
      try {
        RNIap.endConnection();
      } catch (e) {
        console.warn('[IAP] Failed to close connection:', e);
      }
    };
  }, []);

  // Pre-Purchase Network Guard & Purchase Handler
  const requestPurchase = async () => {
    if (Platform.OS === 'web') {
      useAppStore.getState().showAlert('Unavailable', 'Purchases are not supported in the web preview.');
      return;
    }

    setIsLoading(true);
    try {
      const netState = await Network.getNetworkStateAsync();
      if (!netState.isConnected) {
        useAppStore.getState().showAlert('Internet Connection Required', 'Please connect to the internet to complete this purchase.');
        setIsLoading(false);
        return;
      }

      if (!premiumProduct && RNIap) {
        const products = await RNIap.fetchProducts({ skus: [PREMIUM_PRODUCT_ID] });
        if (products && products.length > 0) {
          setPremiumProduct(products[0]);
        } else {
          useAppStore.getState().showAlert(
            'Billing Error',
            'Unable to contact the Google Play Store / App Store. Please check your store account connection.'
          );
          setIsLoading(false);
          return;
        }
      }

      await RNIap.requestPurchase({
        request: {
          ios: { sku: PREMIUM_PRODUCT_ID },
          android: { skus: [PREMIUM_PRODUCT_ID] },
        },
      });
    } catch (e: any) {
      console.warn('[IAP] Request purchase failed:', e);
      useAppStore.getState().showAlert('Purchase Failed', e?.message || 'Unable to process purchase.');
    } finally {
      setIsLoading(false);
    }
  };

  // Restore Purchases Flow
  const restorePurchases = async (): Promise<{ success: boolean; message: string }> => {
    if (Platform.OS === 'web') {
      return { success: false, message: 'Purchases are not supported in the web preview.' };
    }

    setIsLoading(true);
    try {
      const netState = await Network.getNetworkStateAsync();
      if (!netState.isConnected) {
        return { success: false, message: 'Please connect to the internet to restore purchases.' };
      }

      const purchases = await RNIap.getAvailablePurchases();
      const hasPurchasedPremium = purchases.some(
        (p: any) => p.productId === PREMIUM_PRODUCT_ID
      );

      if (hasPurchasedPremium) {
        await AsyncStorage.setItem(LOCAL_PREMIUM_KEY, 'true');
        setIsPremium(true);
        return { success: true, message: 'Your premium purchase has been restored!' };
      } else {
        return { success: false, message: 'No active premium purchases were found for your account.' };
      }
    } catch (err: any) {
      console.warn('[IAP] Restore purchases failed:', err);
      return { success: false, message: 'Could not restore purchases. Please try again later.' };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IAPContext.Provider
      value={{
        isPremium,
        premiumProduct,
        isLoading,
        requestPurchase,
        restorePurchases,
      }}
    >
      {children}
    </IAPContext.Provider>
  );
};

export const useIAP = () => useContext(IAPContext);
