import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { PaginatedResponseType } from '../../types/api.types';
import { TrainingSessionInterface } from '../../types/models.types';

export const sessionService = {
  async getSessions(
    page: number = 1,
    perPage: number = 15,
  ): Promise<PaginatedResponseType<TrainingSessionInterface>> {
    const { data } = await apiClient.get<
      PaginatedResponseType<TrainingSessionInterface>
    >(ENDPOINTS.SWIMMER.SESSIONS, {
      params: { page, per_page: perPage },
    });
    return data;
  },
};
