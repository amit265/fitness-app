import { useAppStore } from "../../store/useAppStore";
import { getMessaging, getToken, requestPermission, onMessage, AuthorizationStatus } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { Alert } from '../../utils/alertUtils';



export const requestUserPermission = async () => {
  if (Platform.OS === 'web') return null;
  const msg = getMessaging();
  const authStatus = await requestPermission(msg);
  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    return await getFCMToken();
  }
  return null;
};

export const getFCMToken = async () => {
  if (Platform.OS === 'web') return null;
  try {
    const msg = getMessaging();
    const token = await getToken(msg);
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Failed to get FCM token', error);
    return null;
  }
};

export const initializeMessaging = () => {
  if (Platform.OS === 'web') return () => {};
  const msg = getMessaging();
  // Handle messages when app is in foreground
  const unsubscribe = onMessage(msg, async remoteMessage => {
    useAppStore.getState().showAlert(
      remoteMessage.notification?.title || 'New Message',
      remoteMessage.notification?.body || 'You have received a new notification!'
    );
  });

  return unsubscribe;
};
