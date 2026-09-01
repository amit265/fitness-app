import AsyncStorage from '@react-native-async-storage/async-storage';
import { AD_CONFIG } from './adConfig';

const REWARDED_SILENCE_UNTIL_KEY = 'ds_rewarded_silence_until';
const SESSION_COUNT_KEY = 'ds_app_session_count';

class AdFrequencyTracker {
  private lastInterstitialShownAt: number = 0;
  private lastAppOpenShownAt: number = 0;
  private lastFullscreenAdAt: number = 0;
  private rewardedSilenceUntil: number = 0;
  private sessionCount: number = 0;

  constructor() {
    this.loadPersistedState();
  }

  public async loadPersistedState(): Promise<void> {
    try {
      const silenceStr = await AsyncStorage.getItem(REWARDED_SILENCE_UNTIL_KEY);
      if (silenceStr) {
        this.rewardedSilenceUntil = parseInt(silenceStr, 10) || 0;
      }
      const sessionStr = await AsyncStorage.getItem(SESSION_COUNT_KEY);
      if (sessionStr) {
        this.sessionCount = parseInt(sessionStr, 10) || 0;
      }
    } catch (e) {
      console.warn('[AdFrequency] Error loading persisted frequency state:', e);
    }
  }

  public async incrementSessionCount(): Promise<number> {
    this.sessionCount += 1;
    try {
      await AsyncStorage.setItem(SESSION_COUNT_KEY, this.sessionCount.toString());
    } catch (e) {
      console.warn('[AdFrequency] Error saving session count:', e);
    }
    return this.sessionCount;
  }

  public getSessionCount(): number {
    return this.sessionCount;
  }

  public async setRewardedSilenceMinutes(minutes: number = 15): Promise<number> {
    const silenceUntil = Date.now() + minutes * 60 * 1000;
    this.rewardedSilenceUntil = silenceUntil;
    try {
      await AsyncStorage.setItem(REWARDED_SILENCE_UNTIL_KEY, silenceUntil.toString());
    } catch (e) {
      console.warn('[AdFrequency] Error saving rewarded silence timestamp:', e);
    }
    return silenceUntil;
  }

  public isRewardedSilenceActive(): boolean {
    return Date.now() < this.rewardedSilenceUntil;
  }

  public getRewardedSilenceExpiration(): number | null {
    return this.isRewardedSilenceActive() ? this.rewardedSilenceUntil : null;
  }

  public recordInterstitialShown(): void {
    const now = Date.now();
    this.lastInterstitialShownAt = now;
    this.lastFullscreenAdAt = now;
  }

  public recordAppOpenShown(): void {
    const now = Date.now();
    this.lastAppOpenShownAt = now;
    this.lastFullscreenAdAt = now;
  }

  public canShowInterstitial(): boolean {
    const now = Date.now();
    if (this.isRewardedSilenceActive()) return false;

    // Check interstitial cooldown (10 minutes)
    const interstitialCooldownMs = AD_CONFIG.interstitial.cooldownMinutes * 60 * 1000;
    if (now - this.lastInterstitialShownAt < interstitialCooldownMs) return false;

    // Check global fullscreen cooldown (5 minutes)
    const globalCooldownMs = AD_CONFIG.frequency.minGlobalFullscreenCooldownMinutes * 60 * 1000;
    if (now - this.lastFullscreenAdAt < globalCooldownMs) return false;

    return true;
  }

  public canShowAppOpen(): boolean {
    const now = Date.now();
    if (this.isRewardedSilenceActive()) return false;

    // Must have completed minimum sessions (e.g. 2 sessions)
    if (this.sessionCount < AD_CONFIG.appOpen.minUsageSessionsBeforeFirstAd) return false;

    // Check App Open cooldown (30 minutes)
    const appOpenCooldownMs = AD_CONFIG.appOpen.cooldownMinutes * 60 * 1000;
    if (now - this.lastAppOpenShownAt < appOpenCooldownMs) return false;

    // Check global fullscreen cooldown (5 minutes)
    const globalCooldownMs = AD_CONFIG.frequency.minGlobalFullscreenCooldownMinutes * 60 * 1000;
    if (now - this.lastFullscreenAdAt < globalCooldownMs) return false;

    return true;
  }
}

export const adFrequency = new AdFrequencyTracker();
