import { create } from 'zustand';
import {
  SessionDetailInterface,
  TrainingSessionInterface,
} from '../types/models.types';
import {
  sessionService,
  SessionCounts,
} from '../api/services/session.service';

/** A tab on the Sessions screen. */
export type SessionSegment = 'all' | 'upcoming' | 'completed';

export const SESSIONS_PAGE_SIZE = 15;

/**
 * A refresh reloads everything already scrolled into view in one request, up to
 * this many rows. A multiple of the page size, so the next "load more" page
 * lines up with what is already there.
 */
const REFRESH_MAX_ROWS = SESSIONS_PAGE_SIZE * 6;

interface SegmentState {
  items: TrainingSessionInterface[];
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

const emptySegments = (): Record<SessionSegment, SegmentState> => ({
  all: emptySegment(),
  upcoming: emptySegment(),
  completed: emptySegment(),
});

const SEGMENT_KEYS: SessionSegment[] = ['all', 'upcoming', 'completed'];

/** Append a page, dropping rows already listed (rows shift if sessions change between pages). */
const mergeById = (
  current: TrainingSessionInterface[],
  next: TrainingSessionInterface[],
): TrainingSessionInterface[] => {
  const seen = new Set(current.map((s) => s.id));
  return [...current, ...next.filter((s) => !seen.has(s.id))];
};

interface SessionState {
  /**
   * One list per tab, each filtered, sorted and paginated by the server.
   *
   * There used to be a single newest-first list that the screen split into tabs
   * itself. With sessions generated weeks ahead, page one held only future
   * sessions, so Completed read 0 until the swimmer scrolled — and every refresh
   * reloaded page one and emptied it again.
   */
  segments: Record<SessionSegment, SegmentState>;
  /** Badge counts for every tab, from the last response. */
  counts: SessionCounts | null;
  fetchSegment: (segment: SessionSegment, page?: number) => Promise<void>;
  /** Reload a tab, keeping as many rows as were already loaded. */
  refreshSegment: (segment: SessionSegment, showSpinner?: boolean) => Promise<void>;
  /** Silent refresh of every tab that has been opened — polling and real-time events. */
  refreshSessions: () => Promise<void>;

  /** The session open on the detail page. */
  sessionDetail: SessionDetailInterface | null;
  isDetailLoading: boolean;
  detailError: string | null;
  fetchSessionDetail: (id: number) => Promise<void>;

  reset: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => {
  const patchSegment = (segment: SessionSegment, patch: Partial<SegmentState>) =>
    set((state) => ({
      segments: {
        ...state.segments,
        [segment]: { ...state.segments[segment], ...patch },
      },
    }));

  return {
    segments: emptySegments(),
    counts: null,
    sessionDetail: null,
    isDetailLoading: false,
    detailError: null,

    fetchSegment: async (segment, page = 1) => {
      const current = get().segments[segment];
      if (current.isLoading) return;
      patchSegment(segment, { isLoading: true, error: null });
      try {
        const response = await sessionService.getSessions(
          page,
          SESSIONS_PAGE_SIZE,
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
            counts: response.counts ?? state.counts,
          };
        });
      } catch {
        // A failed "load more" keeps the rows already shown; only an empty tab
        // shows the error.
        patchSegment(segment, {
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
        Math.max(SESSIONS_PAGE_SIZE, current.page * SESSIONS_PAGE_SIZE),
      );
      if (showSpinner) patchSegment(segment, { isRefreshing: true });
      try {
        const response = await sessionService.getSessions(1, rows, segment);
        set((state) => ({
          segments: {
            ...state.segments,
            [segment]: {
              ...state.segments[segment],
              items: response.data,
              // Re-express what was loaded in page-size pages, so the next
              // "load more" continues right after the last row.
              page: Math.max(1, Math.ceil(response.data.length / SESSIONS_PAGE_SIZE)),
              lastPage: Math.max(1, Math.ceil(response.total / SESSIONS_PAGE_SIZE)),
              isRefreshing: false,
              error: null,
            },
          },
          counts: response.counts ?? state.counts,
        }));
      } catch {
        // Silent: keep showing what is there.
        patchSegment(segment, { isRefreshing: false });
      }
    },

    refreshSessions: async () => {
      const { segments, refreshSegment } = get();
      await Promise.all(
        SEGMENT_KEYS.filter((key) => segments[key].loaded).map((key) => refreshSegment(key)),
      );
    },

    fetchSessionDetail: async (id: number) => {
      // A different session is opening: drop the previous one so its details
      // never flash on screen under the new title.
      if (get().sessionDetail?.id !== id) {
        set({ sessionDetail: null });
      }
      set({ isDetailLoading: true, detailError: null });
      try {
        const detail = await sessionService.getSessionDetail(id);
        set({ sessionDetail: detail, isDetailLoading: false });
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } }).response?.status;
        set({
          isDetailLoading: false,
          detailError:
            status === 404
              ? "This session isn't available anymore."
              : "Couldn't load this session. Check your connection and try again.",
        });
      }
    },

    reset: () =>
      set({
        segments: emptySegments(),
        counts: null,
        sessionDetail: null,
        isDetailLoading: false,
        detailError: null,
      }),
  };
});
