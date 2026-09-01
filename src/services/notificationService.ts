import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATION_SCHEDULED_KEY = 'ds_daily_notification_scheduled_v1';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const setupDailyEngagementNotifications = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false; // Skip on web
  }

  try {
    // 1. Check if already scheduled once
    const alreadyScheduled = await AsyncStorage.getItem(NOTIFICATION_SCHEDULED_KEY);
    if (alreadyScheduled === 'true') {
      return true; // Already scheduled, exit immediately to prevent re-triggering on every open!
    }

    // 2. Request permissions if not granted
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // 3. Cancel existing scheduled notifications to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 4. Schedule a single recurring daily reminder at 7:00 PM (19:00)
    const triggerInput: any = Platform.OS === 'android'
      ? { hour: 19, minute: 0, repeats: true }
      : { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 19, minute: 0 };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for your daily readiness check-in! 🧘‍♀️',
        body: "Track today's workout, log your energy & check your cycle readiness.",
        sound: true,
      },
      trigger: triggerInput,
    });

    // 5. Mark as scheduled in AsyncStorage so it NEVER runs again on subsequent cold starts
    await AsyncStorage.setItem(NOTIFICATION_SCHEDULED_KEY, 'true');
    return true;
  } catch (error) {
    console.warn('[NotificationService] Error setting up daily notification:', error);
    return false;
  }
};
