import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { SwimmerTrainingPlanResponse } from '../../types/models.types';

export const trainingPlanService = {
  async getMyTrainingPlan(): Promise<SwimmerTrainingPlanResponse | null> {
    try {
      const { data } = await apiClient.get<SwimmerTrainingPlanResponse>(
        ENDPOINTS.SWIMMER.TRAINING_PLAN,
      );
      return data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
