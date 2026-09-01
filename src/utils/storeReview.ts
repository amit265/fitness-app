import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const REVIEW_KEY_PREFIX = 'ds_store_review_prompted_';

export const triggerStoreReviewIfAppropriate = async (milestoneKey: string = 'general') => {
  if (Platform.OS === 'web') return;

  try {
    const storageKey = `${REVIEW_KEY_PREFIX}${milestoneKey}`;
    const hasPrompted = await AsyncStorage.getItem(storageKey);

    if (hasPrompted === 'true') return;

    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
      await AsyncStorage.setItem(storageKey, 'true');
    }
  } catch (err) {
    console.warn('[StoreReview] Failed to trigger review prompt:', err);
  }
};
