import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { ClubAnalytics, CoachPerformanceSummary } from '../../types/analytics.types';
import { storageService } from '../../services/storage.service';

const CACHE_KEY = 'manager_analytics';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CachedAnalytics {
  data: ClubAnalytics;
  timestamp: number;
}

export const managerService = {
  async getAnalytics(forceRefresh = false): Promise<ClubAnalytics> {
    // Check cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = await storageService.get(CACHE_KEY);
      if (cached) {
        try {
          const parsed: CachedAnalytics = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            return parsed.data;
          }
        } catch {
          // Invalid cache, continue to fetch
        }
      }
    }

    // Fetch from API
    const { data } = await apiClient.get<ClubAnalytics>(
      ENDPOINTS.CLUB.ANALYTICS,
    );

    // Store in cache
    const cacheEntry: CachedAnalytics = {
      data,
      timestamp: Date.now(),
    };
    await storageService.set(CACHE_KEY, JSON.stringify(cacheEntry));

    return data;
  },

  async getCoachPerformance(): Promise<CoachPerformanceSummary[]> {
    const { data } = await apiClient.get<CoachPerformanceSummary[]>(
      ENDPOINTS.CLUB.COACHES_PERFORMANCE,
    );
    return Array.isArray(data) ? data : (data as unknown as { data: CoachPerformanceSummary[] }).data ?? [];
  },
};
