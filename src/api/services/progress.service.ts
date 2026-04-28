import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import {
  DashboardResponseType,
  StatsResponseType,
  LeaderboardResponseType,
  PaginatedResponseType,
} from '../../types/api.types';
import { EvaluationInterface } from '../../types/models.types';

export const progressService = {
  async getDashboard(): Promise<DashboardResponseType> {
    const { data } = await apiClient.get<DashboardResponseType>(
      ENDPOINTS.SWIMMER.DASHBOARD,
    );
    return data;
  },

  async getStats(): Promise<StatsResponseType> {
    const { data } = await apiClient.get<StatsResponseType>(
      ENDPOINTS.SWIMMER.STATS,
    );
    return data;
  },

  async getEvaluations(
    page: number = 1,
    perPage: number = 15,
  ): Promise<PaginatedResponseType<EvaluationInterface>> {
    const { data } = await apiClient.get<
      PaginatedResponseType<EvaluationInterface>
    >(ENDPOINTS.SWIMMER.EVALUATIONS, {
      params: { page, per_page: perPage },
    });
    return data;
  },

  async getLeaderboard(): Promise<LeaderboardResponseType> {
    const { data } = await apiClient.get<LeaderboardResponseType>(
      ENDPOINTS.SWIMMER.LEADERBOARD,
    );
    return data;
  },
};
