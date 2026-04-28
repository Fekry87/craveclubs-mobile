import Constants from 'expo-constants';
import { Platform } from 'react-native';
import apiClient from '../client';

export interface VersionCheckResponse {
  current_version: string;
  minimum_version: string;
  latest_version: string;
  update_available: boolean;
  force_update: boolean;
  update_url: { ios: string; android: string };
  message: string | null;
}

export const checkAppVersion = async (): Promise<VersionCheckResponse> => {
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const platform = Platform.OS;
  const response = await apiClient.get<VersionCheckResponse>('/app/version-check', {
    headers: {
      'X-App-Version': appVersion,
      'X-Platform': platform,
    },
  });
  return response.data;
};
