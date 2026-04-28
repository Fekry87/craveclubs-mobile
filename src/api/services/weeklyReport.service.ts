import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { WeeklyReport } from '../../types/weeklyReport';

export const weeklyReportService = {
  async getWeeklyReport(week?: string): Promise<WeeklyReport> {
    const { data } = await apiClient.get<WeeklyReport>(
      ENDPOINTS.SWIMMER.WEEKLY_REPORT,
      { params: week ? { week } : undefined },
    );
    return data;
  },
};
