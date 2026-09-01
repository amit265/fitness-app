import { Platform } from 'react-native';
import { getAnalytics, logEvent } from '@react-native-firebase/analytics';

export type AnalyticsEventName =
  | 'checkin_completed'
  | 'workout_logged'
  | 'meal_logged'
  | 'cycle_logged'
  | 'ai_question_asked'
  | 'streak_milestone_hit'
  | 'cross_promo_clicked'
  | 'app_updated';

export const logAnalyticsEvent = (
  eventName: AnalyticsEventName,
  params?: Record<string, any>
) => {
  try {
    const timestamp = new Date().toISOString();
    const eventPayload = {
      event: eventName,
      platform: Platform.OS,
      timestamp,
      ...params,
    };

    if (__DEV__) {
      console.log(`[Analytics Event: ${eventName}]`, eventPayload);
    } else {
      // Log natively to Firebase Analytics
      logEvent(getAnalytics(), eventName, params);
    }

    // Web fallback or native telemetry analytics hook
    if (Platform.OS === 'web' && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, params);
    }
  } catch (err) {
    console.warn('[Analytics Error]', err);
  }
};
