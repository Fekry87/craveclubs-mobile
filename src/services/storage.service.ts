import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth tokens stored in secure keychain/keystore (native) or AsyncStorage (web fallback)
const SECURE_KEYS = {
  AUTH_TOKEN: 'craveclubs_auth_token',
} as const;

// Non-sensitive data stays in AsyncStorage
const STORAGE_KEYS = {
  USER_DATA: '@swimming_app/user_data',
} as const;

// Web fallback: SecureStore is not available on web, use AsyncStorage instead
const isWeb = Platform.OS === 'web';

export const storageService = {
  // ── Secure token storage (Keychain on iOS, Keystore on Android, AsyncStorage on web) ──
  async getToken(): Promise<string | null> {
    if (isWeb) return AsyncStorage.getItem(SECURE_KEYS.AUTH_TOKEN);
    return SecureStore.getItemAsync(SECURE_KEYS.AUTH_TOKEN);
  },

  async setToken(token: string): Promise<void> {
    if (isWeb) {
      await AsyncStorage.setItem(SECURE_KEYS.AUTH_TOKEN, token);
      return;
    }
    await SecureStore.setItemAsync(SECURE_KEYS.AUTH_TOKEN, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
  },

  async removeToken(): Promise<void> {
    if (isWeb) {
      await AsyncStorage.removeItem(SECURE_KEYS.AUTH_TOKEN);
      return;
    }
    await SecureStore.deleteItemAsync(SECURE_KEYS.AUTH_TOKEN);
  },

  // ── Non-sensitive user data (preferences, cached profile) ──
  async getUserData<T>(): Promise<T | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  async setUserData<T>(data: T): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
  },

  async removeUserData(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  async clearAll(): Promise<void> {
    if (isWeb) {
      await AsyncStorage.removeItem(SECURE_KEYS.AUTH_TOKEN);
    } else {
      await SecureStore.deleteItemAsync(SECURE_KEYS.AUTH_TOKEN);
    }
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  // ── Generic key-value (non-sensitive, AsyncStorage) ──
  async get(key: string): Promise<string | null> {
    return AsyncStorage.getItem(`@craveclubs/${key}`);
  },

  async set(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(`@craveclubs/${key}`, value);
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(`@craveclubs/${key}`);
  },
};
