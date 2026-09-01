import { AdFormatType } from './adConfig';

export type ScreenName =
  | 'home'
  | 'cycle'
  | 'foodLogging'
  | 'activityLogging'
  | 'progress'
  | 'coach'
  | 'settings'
  | 'bmi'
  | 'editProfile'
  | 'onboarding';

export interface ScreenAdPolicy {
  native: boolean;
  banner: boolean;
  interstitial: boolean;
  rewarded?: boolean;
}

/**
 * Screen-level Ad Policies as specified in Section 33 & 34 of the Sini AI Monetization Spec.
 * Default is strict DENY unless explicitly permitted.
 */
export const SCREEN_AD_POLICIES: Record<ScreenName, ScreenAdPolicy> = {
  home: {
    native: true,
    banner: false,
    interstitial: false,
    rewarded: false,
  },
  cycle: {
    native: false,
    banner: false,
    interstitial: false,
    rewarded: false,
  },
  foodLogging: {
    native: false,
    banner: false,
    interstitial: false,
    rewarded: false,
  },
  activityLogging: {
    native: false,
    banner: false,
    interstitial: false,
    rewarded: false,
  },
  progress: {
    native: true,
    banner: false,
    interstitial: false,
    rewarded: false,
  },
  coach: {
    native: false,
    banner: false,
    interstitial: false,
    rewarded: false,
  },
  settings: {
    native: true,
    banner: false,
    interstitial: false,
    rewarded: true,
  },
  bmi: {
    native: false,
    banner: false,
    interstitial: false,
    rewarded: false,
  },
  editProfile: {
    native: false,
    banner: false,
    interstitial: false,
    rewarded: false,
  },
  onboarding: {
    native: false,
    banner: false,
    interstitial: false,
    rewarded: false,
  },
};

/**
 * Helper to check if a screen allows a given ad format according to screen policy.
 */
export const isAdAllowedOnScreen = (format: AdFormatType, screen?: ScreenName): boolean => {
  if (!screen) return false;
  const policy = SCREEN_AD_POLICIES[screen];
  if (!policy) return false;

  switch (format) {
    case 'native':
      return policy.native;
    case 'banner':
      return policy.banner;
    case 'interstitial':
      return policy.interstitial;
    case 'rewarded':
      return policy.rewarded ?? false;
    case 'appOpen':
      return true; // App Open is governed by app lifecycle & global frequency, not individual tab policy
    default:
      return false;
  }
};
