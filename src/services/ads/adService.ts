export * from './adConfig';
export * from './adPolicy';
export * from './adFrequency';
export * from './adEligibility';
export * from './rewardedAdService';
export * from './interstitialAdService';
export * from './appOpenAdService';

import { adFrequency } from './adFrequency';

export const initializeAdService = async (): Promise<void> => {
  await adFrequency.loadPersistedState();
  await adFrequency.incrementSessionCount();
};
