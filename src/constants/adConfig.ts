import { Platform } from 'react-native';

/**
 * Official Google AdMob Test Ad Unit IDs
 * Used in development mode and as safe fallback.
 */
export const TEST_AD_UNITS = {
  banner: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
    default: 'ca-app-pub-3940256099942544/6300978111',
  }),
  interstitial: Platform.select({
    ios: 'ca-app-pub-3940256099942544/4486956142',
    android: 'ca-app-pub-3940256099942544/1033173712',
    default: 'ca-app-pub-3940256099942544/1033173712',
  }),
  rewarded: Platform.select({
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
    default: 'ca-app-pub-3940256099942544/5224354917',
  }),
};

/**
 * Real Production Ad Unit IDs
 * When real production ad unit IDs are generated from Google AdMob console, add them here.
 */
export const PRODUCTION_AD_UNITS = {
  banner: Platform.select({
    ios: '', // Real iOS Banner Unit ID (Add when generated)
    android: '', // Real Android Banner Unit ID (Add when generated)
    default: '',
  }),
  interstitial: Platform.select({
    ios: '',
    android: '',
    default: '',
  }),
  rewarded: Platform.select({
    ios: '',
    android: '',
    default: '',
  }),
};

/**
 * Returns Test Ad Unit ID in __DEV__ mode, or Production Ad Unit ID in production builds.
 * Automatically falls back to Test ID if real production ID is empty.
 */
export const getAdUnitId = (type: 'banner' | 'interstitial' | 'rewarded'): string => {
  if (__DEV__) {
    return TEST_AD_UNITS[type] || '';
  }
  const prodId = PRODUCTION_AD_UNITS[type];
  return prodId && prodId.length > 0 ? prodId : (TEST_AD_UNITS[type] || '');
};
