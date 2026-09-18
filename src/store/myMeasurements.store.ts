import { create } from 'zustand';
import {
  MeasurementDayInterface,
  MeasurementProgressInterface,
} from '../types/models.types';
import { measurementService } from '../api/services/measurement.service';

const PAGE_SIZE = 15;

interface MyMeasurementsState {
  /** Training days that have times, newest first; each holds its measurements. */
  days: MeasurementDayInterface[];
  page: number;
  lastPage: number;
  loaded: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  /** The club does not have the feature (403): the tab says so instead of erroring. */
  unavailable: boolean;
  /** Weekly pace averages for the chart; null until loaded, silent on failure. */
  progress: MeasurementProgressInterface | null;

  fetchDays: (page?: number) => Promise<void>;
  fetchProgress: () => Promise<void>;
  refresh: (showSpinner?: boolean) => Promise<void>;
  reset: () => void;
}

const initial = {
  days: [] as MeasurementDayInterface[],
  page: 0,
  lastPage: 1,
  loaded: false,
  isLoading: false,
  isRefreshing: false,
  error: null as string | null,
  unavailable: false,
  progress: null as MeasurementProgressInterface | null,
};

/** Append a page of days; the server paginates by day, so a date never repeats — but stay safe. */
const mergeByDate = (
  current: MeasurementDayInterface[],
  next: MeasurementDayInterface[],
): MeasurementDayInterface[] => {
  const seen = new Set(current.map((d) => d.date));
  return [...current, ...next.filter((d) => !seen.has(d.date))];
};

/** القياس — the swimmer's own recorded times, for the Measurements tab under My Plan. */
export const useMyMeasurementsStore = create<MyMeasurementsState>((set, get) => ({
  ...initial,

  fetchDays: async (page = 1) => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const response = await measurementService.getMine(page, PAGE_SIZE);
      set((state) => ({
        days: page === 1 ? response.data : mergeByDate(state.days, response.data),
        page: response.current_page,
        lastPage: response.last_page,
        loaded: true,
        isLoading: false,
        unavailable: false,
      }));
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      set({
        isLoading: false,
        loaded: true,
        unavailable: status === 403,
        // A failed "load more" keeps the days already shown.
        error:
          status === 403 || get().days.length > 0 ? null : "We couldn't load your times.",
      });
    }
  },

  fetchProgress: async () => {
    try {
      const progress = await measurementService.getProgress();
      set({ progress });
    } catch {
      // Silent: the chart is a bonus on top of the list; the list reports errors.
    }
  },

  refresh: async (showSpinner = false) => {
    if (get().isLoading || get().isRefreshing) return;
    if (!get().loaded) {
      await get().fetchDays(1);
      return;
    }
    if (showSpinner) set({ isRefreshing: true });
    try {
      const response = await measurementService.getMine(1, PAGE_SIZE);
      set({
        days: response.data,
        page: response.current_page,
        lastPage: response.last_page,
        isRefreshing: false,
        error: null,
        unavailable: false,
      });
    } catch {
      // Silent: keep showing what is there.
      set({ isRefreshing: false });
    }
  },

  reset: () => set({ ...initial }),
}));
