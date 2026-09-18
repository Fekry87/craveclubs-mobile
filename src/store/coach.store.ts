import { create } from 'zustand';
import {
  CoachDashboardInterface,
  CoachSessionInterface,
  CoachGroupInterface,
  SessionCompletePayload,
  SessionCreatePayload,
  SwimmerProfileInterface,
} from '../types/models.types';
import { coachService, CoachSessionScope } from '../api/services/coach.service';

export const COACH_SESSIONS_PAGE_SIZE = 20;

/**
 * A refresh reloads everything already scrolled into view in one request, up to
 * this many rows (the endpoint's page-size ceiling is 100). A multiple of the
 * page size, so the next "load more" page lines up with what is already there.
 */
const REFRESH_MAX_ROWS = COACH_SESSIONS_PAGE_SIZE * 5;

export interface CoachSessionCounts {
  all: number;
  upcoming: number;
  completed: number;
}

interface SegmentState {
  items: CoachSessionInterface[];
  /** Last page loaded; 0 before the first load. */
  page: number;
  lastPage: number;
  loaded: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

const emptySegment = (): SegmentState => ({
  items: [],
  page: 0,
  lastPage: 1,
  loaded: false,
  isLoading: false,
  isRefreshing: false,
  error: null,
});

const emptySegments = (): Record<CoachSessionScope, SegmentState> => ({
  all: emptySegment(),
  upcoming: emptySegment(),
  completed: emptySegment(),
});

const SEGMENT_KEYS: CoachSessionScope[] = ['all', 'upcoming', 'completed'];

/** Append a page, dropping rows already listed (rows shift if sessions change between pages). */
const mergeById = (
  current: CoachSessionInterface[],
  next: CoachSessionInterface[],
): CoachSessionInterface[] => {
  const seen = new Set(current.map((s) => s.id));
  return [...current, ...next.filter((s) => !seen.has(s.id))];
};

interface CoachState {
  /* Dashboard */
  dashboard: CoachDashboardInterface | null;
  isDashboardLoading: boolean;
  dashboardError: string | null;

  /**
   * Sessions list: one list per tab, each filtered, sorted and paginated by
   * the server — the same fix the swimmer's session.store got. A single
   * newest-first list split into tabs on the device put only generated future
   * sessions on page one, so Completed read 0 until the coach scrolled.
   */
  segments: Record<CoachSessionScope, SegmentState>;
  /** Badge counts for every tab, from the last response. */
  sessionCounts: CoachSessionCounts | null;

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
  fetchSegment: (segment: CoachSessionScope, page?: number) => Promise<void>;
  /** Reload a tab, keeping as many rows as were already loaded. */
  refreshSegment: (segment: CoachSessionScope, showSpinner?: boolean) => Promise<void>;
  /** Silent refresh of every tab that has been opened. */
  refreshSessions: () => Promise<void>;
  fetchSessionDetail: (id: number) => Promise<void>;
  startSession: (id: number) => Promise<void>;
  completeSession: (id: number, payload: SessionCompletePayload) => Promise<void>;
  fetchRoster: (id: number) => Promise<void>;
  fetchGroups: () => Promise<void>;
  createSession: (payload: SessionCreatePayload) => Promise<CoachSessionInterface | null>;
  clearSelected: () => void;
  reset: () => void;
}

type SetState = (
  partial: Partial<CoachState> | ((state: CoachState) => Partial<CoachState>),
) => void;

const patchSegment = (
  set: SetState,
  segment: CoachSessionScope,
  patch: Partial<SegmentState>,
) =>
  set((state) => ({
    segments: {
      ...state.segments,
      [segment]: { ...state.segments[segment], ...patch },
    },
  }));

export const useCoachStore = create<CoachState>((set, get) => ({
  dashboard: null,
  isDashboardLoading: false,
  dashboardError: null,

  segments: emptySegments(),
  sessionCounts: null,

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

  fetchSegment: async (segment, page = 1) => {
    if (get().segments[segment].isLoading) return;
    patchSegment(set, segment, { isLoading: true, error: null });
    try {
      const response = await coachService.getSessions(
        page,
        COACH_SESSIONS_PAGE_SIZE,
        segment,
      );
      set((state) => {
        const seg = state.segments[segment];
        return {
          segments: {
            ...state.segments,
            [segment]: {
              ...seg,
              items: page === 1 ? response.data : mergeById(seg.items, response.data),
              page: response.current_page,
              lastPage: response.last_page,
              loaded: true,
              isLoading: false,
              error: null,
            },
          },
          sessionCounts: response.counts ?? state.sessionCounts,
        };
      });
    } catch {
      // A failed "load more" keeps the rows already shown; only an empty tab
      // shows the error.
      patchSegment(set, segment, {
        isLoading: false,
        error: get().segments[segment].items.length > 0 ? null : 'Failed to load sessions.',
      });
    }
  },

  refreshSegment: async (segment, showSpinner = false) => {
    const current = get().segments[segment];
    if (!current.loaded) {
      await get().fetchSegment(segment);
      return;
    }
    if (current.isLoading || current.isRefreshing) return;

    const rows = Math.min(
      REFRESH_MAX_ROWS,
      Math.max(COACH_SESSIONS_PAGE_SIZE, current.page * COACH_SESSIONS_PAGE_SIZE),
    );
    if (showSpinner) patchSegment(set, segment, { isRefreshing: true });
    try {
      const response = await coachService.getSessions(1, rows, segment);
      set((state) => ({
        segments: {
          ...state.segments,
          [segment]: {
            ...state.segments[segment],
            items: response.data,
            // Re-express what was loaded in page-size pages, so the next
            // "load more" continues right after the last row.
            page: Math.max(1, Math.ceil(response.data.length / COACH_SESSIONS_PAGE_SIZE)),
            lastPage: Math.max(1, Math.ceil(response.total / COACH_SESSIONS_PAGE_SIZE)),
            isRefreshing: false,
            error: null,
          },
        },
        sessionCounts: response.counts ?? state.sessionCounts,
      }));
    } catch {
      // Silent: keep showing what is there.
      patchSegment(set, segment, { isRefreshing: false });
    }
  },

  refreshSessions: async () => {
    const { segments, refreshSegment } = get();
    await Promise.all(
      SEGMENT_KEYS.filter((key) => segments[key].loaded).map((key) => refreshSegment(key)),
    );
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
      set({ isCreating: false });
      // Where the new session belongs is the server's call (tab, order, counts).
      get().refreshSessions();
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
      segments: emptySegments(),
      sessionCounts: null,
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
