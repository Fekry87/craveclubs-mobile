import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { SwimmerProfileResponseType } from '../../types/api.types';

export const profileService = {
  async getProfile(): Promise<SwimmerProfileResponseType> {
    const { data } = await apiClient.get<SwimmerProfileResponseType>(
      ENDPOINTS.SWIMMER.PROFILE,
    );
    return data;
  },
};
