import { create } from 'zustand';
import { TrainingSessionInterface } from '../types/models.types';
import { sessionService } from '../api/services/session.service';

interface SessionState {
  sessions: TrainingSessionInterface[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  fetchSessions: (page?: number) => Promise<void>;
  refreshSessions: () => Promise<void>;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,

  fetchSessions: async (page: number = 1) => {
    const hasData = get().sessions.length > 0;
    // Only show loading spinner on first load (no existing data)
    if (!hasData) {
      set({ isLoading: true, error: null });
    }
    try {
      const response = await sessionService.getSessions(page);
      set((state) => ({
        sessions:
          page === 1
            ? response.data
            : [...state.sessions, ...response.data],
        currentPage: response.current_page,
        totalPages: response.last_page,
        isLoading: false,
        error: null,
      }));
    } catch {
      // Only show error if there's no existing data to display
      if (!hasData) {
        set({ isLoading: false, error: 'Failed to load sessions.' });
      } else {
        set({ isLoading: false });
      }
    }
  },

  /** Silent refresh — keeps existing data visible until new data arrives.
   *  Does NOT set isLoading or error to avoid UI flicker during polling. */
  refreshSessions: async () => {
    try {
      const response = await sessionService.getSessions(1);
      set({
        sessions: response.data,
        currentPage: response.current_page,
        totalPages: response.last_page,
        error: null,
      });
    } catch {
      // Silent fail — keep showing existing data. Only fetchSessions shows errors.
    }
  },

  reset: () =>
    set({
      sessions: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
    }),
}));
