import { create } from 'zustand';
import {
  CoachDashboardInterface,
  CoachSessionInterface,
  CoachGroupInterface,
  CoachSessionsStatusCounts,
  SessionCompletePayload,
  SessionCreatePayload,
  SwimmerProfileInterface,
} from '../types/models.types';
import { coachService } from '../api/services/coach.service';

interface CoachState {
  /* Dashboard */
  dashboard: CoachDashboardInterface | null;
  isDashboardLoading: boolean;
  dashboardError: string | null;

  /* Sessions list */
  sessions: CoachSessionInterface[];
  statusCounts: CoachSessionsStatusCounts | null;
  isSessionsLoading: boolean;
  sessionsError: string | null;
  currentPage: number;
  totalPages: number;

  /* Selected session detail */
  selectedSession: CoachSessionInterface | null;
  isDetailLoading: boolean;
  detailError: string | null;

  /* Roster */
  roster: SwimmerProfileInterface[];
  isRosterLoading: boolean;

  /* Groups */
  groups: CoachGroupInterface[];
  isGroupsLoading: boolean;

  /* Create session */
  isCreating: boolean;
  createError: string | null;

  /* Actions */
  fetchDashboard: () => Promise<void>;
  fetchSessions: (page?: number, status?: string) => Promise<void>;
  refreshSessions: (status?: string) => Promise<void>;
  fetchSessionDetail: (id: number) => Promise<void>;
  startSession: (id: number) => Promise<void>;
  completeSession: (id: number, payload: SessionCompletePayload) => Promise<void>;
  fetchRoster: (id: number) => Promise<void>;
  fetchGroups: () => Promise<void>;
  createSession: (payload: SessionCreatePayload) => Promise<CoachSessionInterface | null>;
  clearSelected: () => void;
  reset: () => void;
}

export const useCoachStore = create<CoachState>((set, get) => ({
  dashboard: null,
  isDashboardLoading: false,
  dashboardError: null,

  sessions: [],
  statusCounts: null,
  isSessionsLoading: false,
  sessionsError: null,
  currentPage: 1,
  totalPages: 1,

  selectedSession: null,
  isDetailLoading: false,
  detailError: null,

  roster: [],
  isRosterLoading: false,

  groups: [],
  isGroupsLoading: false,

  isCreating: false,
  createError: null,

  fetchDashboard: async () => {
    const hadData = get().dashboard !== null;
    if (!hadData) set({ isDashboardLoading: true, dashboardError: null });
    try {
      const data = await coachService.getDashboard();
      set({ dashboard: data, isDashboardLoading: false, dashboardError: null });
    } catch {
      if (!hadData) {
        set({ isDashboardLoading: false, dashboardError: 'Failed to load dashboard.' });
      } else {
        set({ isDashboardLoading: false });
      }
    }
  },

  fetchSessions: async (page: number = 1, status?: string) => {
    const hadData = get().sessions.length > 0;
    if (!hadData) set({ isSessionsLoading: true, sessionsError: null });
    try {
      const response = await coachService.getSessions(page, 20, status);
      set((state) => ({
        sessions:
          page === 1
            ? response.data
            : [...state.sessions, ...response.data],
        statusCounts: response.status_counts,
        currentPage: response.current_page,
        totalPages: response.last_page,
        isSessionsLoading: false,
        sessionsError: null,
      }));
    } catch {
      if (!hadData) {
        set({ isSessionsLoading: false, sessionsError: 'Failed to load sessions.' });
      } else {
        set({ isSessionsLoading: false });
      }
    }
  },

  /** Silent refresh — keeps existing data visible on failure. */
  refreshSessions: async (status?: string) => {
    try {
      const response = await coachService.getSessions(1, 20, status);
      set({
        sessions: response.data,
        statusCounts: response.status_counts,
        currentPage: response.current_page,
        totalPages: response.last_page,
        sessionsError: null,
      });
    } catch {
      // Silent fail — keep existing data
    }
  },

  fetchSessionDetail: async (id: number) => {
    set({ isDetailLoading: true, detailError: null });
    try {
      const data = await coachService.getSessionDetail(id);
      set({ selectedSession: data, isDetailLoading: false });
    } catch {
      set({
        isDetailLoading: false,
        detailError: 'Failed to load session details.',
      });
    }
  },

  startSession: async (id: number) => {
    try {
      const data = await coachService.startSession(id);
      set({ selectedSession: data });
    } catch {
      set({ detailError: 'Failed to start session.' });
    }
  },

  completeSession: async (id: number, payload: SessionCompletePayload) => {
    try {
      const response = await coachService.completeSession(id, payload);
      set({ selectedSession: response.session });
    } catch {
      set({ detailError: 'Failed to complete session.' });
    }
  },

  fetchRoster: async (id: number) => {
    set({ isRosterLoading: true });
    try {
      const data = await coachService.getSessionRoster(id);
      set({ roster: data.effective_roster, isRosterLoading: false });
    } catch {
      set({ isRosterLoading: false });
    }
  },

  fetchGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const response = await coachService.getGroups();
      const groups = Array.isArray(response)
        ? response
        : (response as unknown as { data: CoachGroupInterface[] }).data ?? [];
      set({ groups, isGroupsLoading: false });
    } catch {
      set({ isGroupsLoading: false });
    }
  },

  createSession: async (payload: SessionCreatePayload) => {
    set({ isCreating: true, createError: null });
    try {
      const session = await coachService.createSession(payload);
      set((state) => ({
        sessions: [session, ...state.sessions],
        isCreating: false,
      }));
      return session;
    } catch {
      set({ isCreating: false, createError: 'Failed to create session.' });
      return null;
    }
  },

  clearSelected: () => {
    set({ selectedSession: null, roster: [], detailError: null });
  },

  reset: () => {
    set({
      dashboard: null,
      isDashboardLoading: false,
      dashboardError: null,
      sessions: [],
      statusCounts: null,
      isSessionsLoading: false,
      sessionsError: null,
      currentPage: 1,
      totalPages: 1,
      selectedSession: null,
      isDetailLoading: false,
      detailError: null,
      roster: [],
      isRosterLoading: false,
      groups: [],
      isGroupsLoading: false,
      isCreating: false,
      createError: null,
    });
  },
}));
