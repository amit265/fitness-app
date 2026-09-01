import { Platform } from 'react-native';

/**
 * Centralized Ad Configuration & Policy Rules
 */
export const AD_CONFIG = {
  native: {
    enabled: true,
  },
  banner: {
    enabled: false, // Banners disabled on main tab screens by default
  },
  interstitial: {
    enabled: true,
    cooldownMinutes: 10,
  },
  rewarded: {
    enabled: true,
    silenceDurationMinutes: 15,
  },
  appOpen: {
    enabled: true,
    cooldownMinutes: 30,
    minUsageSessionsBeforeFirstAd: 2,
  },
  frequency: {
    interstitialCooldownMinutes: 10,
    appOpenCooldownMinutes: 30,
    minGlobalFullscreenCooldownMinutes: 5,
  },
};

/**
 * Official Google AdMob Test Ad Unit IDs
 */
export const TEST_AD_UNITS = {
  native: Platform.select({
    ios: 'ca-app-pub-3940256099942544/3986624511',
    android: 'ca-app-pub-3940256099942544/2247696110',
    default: 'ca-app-pub-3940256099942544/2247696110',
  }),
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
  appOpen: Platform.select({
    ios: 'ca-app-pub-3940256099942544/5575463023',
    android: 'ca-app-pub-3940256099942544/9257395921',
    default: 'ca-app-pub-3940256099942544/9257395921',
  }),
};

/**
 * Real Production Ad Unit IDs
 */
export const PRODUCTION_AD_UNITS = {
  native: Platform.select({
    ios: '',
    android: '',
    default: '',
  }),
  banner: Platform.select({
    ios: '',
    android: '',
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
  appOpen: Platform.select({
    ios: '',
    android: '',
    default: '',
  }),
};

export type AdFormatType = 'native' | 'banner' | 'interstitial' | 'rewarded' | 'appOpen';

/**
 * Returns Test Ad Unit ID in __DEV__ mode, or Production Ad Unit ID in production builds.
 */
export const getAdUnitId = (type: AdFormatType): string => {
  if (__DEV__) {
    return TEST_AD_UNITS[type] || '';
  }
  const prodId = PRODUCTION_AD_UNITS[type];
  return prodId && prodId.length > 0 ? prodId : (TEST_AD_UNITS[type] || '');
};
