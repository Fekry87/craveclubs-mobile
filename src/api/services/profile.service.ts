import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { SwimmerProfileResponseType } from '../../types/api.types';

interface PhotoResponse {
  avatar_url: string | null;
}

export const profileService = {
  async getProfile(): Promise<SwimmerProfileResponseType> {
    const { data } = await apiClient.get<SwimmerProfileResponseType>(
      ENDPOINTS.SWIMMER.PROFILE,
    );
    return data;
  },

  /** `dataUrl` is the 512px square JPEG from `utils/photo.ts`. */
  async uploadPhoto(dataUrl: string): Promise<string | null> {
    const { data } = await apiClient.post<PhotoResponse>(
      ENDPOINTS.SWIMMER.PROFILE_PHOTO,
      { photo: dataUrl },
    );
    return data.avatar_url;
  },

  async removePhoto(): Promise<void> {
    await apiClient.delete(ENDPOINTS.SWIMMER.PROFILE_PHOTO);
  },
};
