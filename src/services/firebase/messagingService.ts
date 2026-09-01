import { getMessaging, getToken, requestPermission, onMessage, AuthorizationStatus } from '@react-native-firebase/messaging';
import { Alert } from '../../utils/alertUtils';



export const requestUserPermission = async () => {
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
  const msg = getMessaging();
  // Handle messages when app is in foreground
  const unsubscribe = onMessage(msg, async remoteMessage => {
    Alert.alert(
      remoteMessage.notification?.title || 'New Message',
      remoteMessage.notification?.body || 'You have received a new notification!'
    );
  });

  return unsubscribe;
};
