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
  /**
   * Photos for the club-name entry screen, uploaded in corporate settings
   * (up to three, filled slots only). Empty keeps the bundled photo. Absent
   * on backends older than this field.
   */
  entry_photo_urls?: string[];
}

export const getPlatformBranding = async (): Promise<PlatformBranding> => {
  const { data } = await apiClient.get<PlatformBranding>(ENDPOINTS.PUBLIC.BRANDING);
  return data;
};
