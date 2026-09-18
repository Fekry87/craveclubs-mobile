import { create } from 'zustand';
import {
  MeasurementInterface,
  MeasurementOptionsInterface,
  MeasurementPayload,
} from '../types/models.types';
import { measurementService } from '../api/services/measurement.service';

interface MeasurementState {
  /** The club's strokes and distances; null until loaded. */
  options: MeasurementOptionsInterface | null;
  isOptionsLoading: boolean;
  optionsError: string | null;

  /** The session whose measurements are loaded, and the rows (newest first). */
  sessionId: number | null;
  measurements: MeasurementInterface[];

  fetchOptions: () => Promise<void>;
  fetchForSession: (sessionId: number) => Promise<void>;
  /** Throws on refusal — the sheet shows the server's reason. */
  record: (sessionId: number, payload: MeasurementPayload) => Promise<MeasurementInterface>;
  /** Optimistic; the row comes back if the server refuses. */
  remove: (sessionId: number, measurementId: number) => Promise<boolean>;
  reset: () => void;
}

export const useMeasurementStore = create<MeasurementState>((set, get) => ({
  options: null,
  isOptionsLoading: false,
  optionsError: null,
  sessionId: null,
  measurements: [],

  fetchOptions: async () => {
    if (get().isOptionsLoading) return;
    set({ isOptionsLoading: true, optionsError: null });
    try {
      const options = await measurementService.getOptions();
      set({ options, isOptionsLoading: false });
    } catch {
      set({
        isOptionsLoading: false,
        optionsError: "We couldn't load the swim types and distances.",
      });
    }
  },

  fetchForSession: async (sessionId) => {
    // Another session is opening: never show the previous one's times under it.
    if (get().sessionId !== sessionId) set({ sessionId, measurements: [] });
    try {
      const measurements = await measurementService.getForSession(sessionId);
      if (get().sessionId === sessionId) set({ measurements });
    } catch {
      // Silent: the list is a convenience; recording still reports its own errors.
    }
  },

  record: async (sessionId, payload) => {
    const measurement = await measurementService.record(sessionId, payload);
    if (get().sessionId === sessionId) {
      set((state) => ({ measurements: [measurement, ...state.measurements] }));
    }
    return measurement;
  },

  remove: async (sessionId, measurementId) => {
    const before = get().measurements;
    set({ measurements: before.filter((m) => m.id !== measurementId) });
    try {
      await measurementService.remove(sessionId, measurementId);
      return true;
    } catch {
      set({ measurements: before });
      return false;
    }
  },

  reset: () =>
    set({
      options: null,
      isOptionsLoading: false,
      optionsError: null,
      sessionId: null,
      measurements: [],
    }),
}));
