import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

/** Platform-level (CraveClubs) branding, incl. the launch splash config. */
export interface PlatformBranding {
  platform_name: string;
  platform_logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  tagline: string;
  splash_background_color: string;
  splash_image_url: string | null;
}

export const getPlatformBranding = async (): Promise<PlatformBranding> => {
  const { data } = await apiClient.get<PlatformBranding>(ENDPOINTS.PUBLIC.BRANDING);
  return data;
};
