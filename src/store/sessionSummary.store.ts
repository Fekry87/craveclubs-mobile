import { create } from 'zustand';
import { progressService } from '../api/services/progress.service';
import {
  DashboardResponseType,
  LeaderboardResponseType,
} from '../types/api.types';

interface SessionSummaryData {
  dashboard: DashboardResponseType | null;
  leaderboard: LeaderboardResponseType | null;
}

interface SessionSummaryState {
  isVisible: boolean;
  isLoading: boolean;
  completedSessionId: number | null;
  summaryData: SessionSummaryData;
  triggerRefreshForCompletion: (sessionId: number) => void;
  dismiss: () => void;
  reset: () => void;
}

export const useSessionSummaryStore = create<SessionSummaryState>(
  (set, get) => ({
    isVisible: false,
    isLoading: false,
    completedSessionId: null,
    summaryData: {
      dashboard: null,
      leaderboard: null,
    },

    triggerRefreshForCompletion: (sessionId: number) => {
      // Don't interrupt an already visible popup
      if (get().isVisible) return;

      set({ isLoading: true, completedSessionId: sessionId });

      Promise.all([
        progressService.getDashboard(),
        progressService.getLeaderboard(),
      ])
        .then(([dashboard, leaderboard]) => {
          set({
            isLoading: false,
            isVisible: true,
            summaryData: { dashboard, leaderboard },
          });
        })
        .catch(() => {
          // Silently fail — don't show popup if data fetch fails
          set({ isLoading: false, completedSessionId: null });
        });
    },

    dismiss: () => {
      set({
        isVisible: false,
        completedSessionId: null,
        summaryData: { dashboard: null, leaderboard: null },
      });
    },

    reset: () =>
      set({
        isVisible: false,
        isLoading: false,
        completedSessionId: null,
        summaryData: { dashboard: null, leaderboard: null },
      }),
  }),
);
