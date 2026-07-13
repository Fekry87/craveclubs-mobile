import Constants from 'expo-constants';
import { Platform } from 'react-native';
import apiClient from '../client';

export interface VersionCheckResponse {
  api_version: string;
  client_version: string | null;
  minimum_version: string;
  latest_version: string;
  update_available: boolean;
  force_update: boolean;
  // Backend resolves the correct store URL per platform (from the X-Platform header).
  store_url: string | null;
  platform: string | null;
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
