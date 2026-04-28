import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { notificationApiService } from '../api/services/notification.service';

/**
 * Check if we're running inside Expo Go (not a dev build).
 * expo-notifications push features were removed from Expo Go on Android in SDK 53.
 */
const isExpoGo = Constants.appOwnership === 'expo';
const skipPush = Platform.OS === 'android' && isExpoGo;

/**
 * Lazy-load expo-notifications — skip entirely on Android Expo Go
 * to avoid the "push notifications removed from Expo Go" error.
 */
let Notifications: typeof import('expo-notifications') | null = null;

if (!skipPush) {
  try {
    Notifications = require('expo-notifications');
  } catch {
    console.log('[Push] expo-notifications not available');
  }
}

/* ── Configure how notifications appear when app is foreground ── */
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Register for push notifications and send the token to the backend.
 * Silently no-ops on: simulators, denied permissions, Android Expo Go.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Notifications) {
    return null;
  }

  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1CB0F6',
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });
  const token = tokenData.data;

  try {
    await notificationApiService.registerPushToken({
      token,
      device_type: Platform.OS as 'ios' | 'android',
    });
  } catch {
    // Silent — token registration is non-critical
  }

  return token;
}

/**
 * Add a listener for when a notification is tapped (app was backgrounded).
 */
export function addNotificationResponseListener(
  handler: (response: any) => void,
): { remove: () => void } | null {
  if (!Notifications) return null;
  return Notifications.addNotificationResponseReceivedListener(handler);
}

/**
 * Add a listener for foreground notifications.
 */
export function addNotificationReceivedListener(
  handler: (notification: any) => void,
): { remove: () => void } | null {
  if (!Notifications) return null;
  return Notifications.addNotificationReceivedListener(handler);
}
