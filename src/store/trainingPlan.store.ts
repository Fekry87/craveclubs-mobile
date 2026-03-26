import { create } from 'zustand';
import {
  TrainingPlanAssignmentInterface,
  TrainingPlanDetailInterface,
  TrainingPlanPhaseData,
} from '../types/models.types';
import { trainingPlanService } from '../api/services/trainingPlan.service';
import { storageService } from '../services/storage.service';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const VIEWED_KEY = 'training_plan_viewed_id';

interface TrainingPlanState {
  assignment: TrainingPlanAssignmentInterface | null;
  plan: TrainingPlanDetailInterface | null;
  phases: TrainingPlanPhaseData[];
  isLoading: boolean;
  error: string | null;
  hasNewPlan: boolean;
  fetchTrainingPlan: () => Promise<void>;
  refreshTrainingPlan: () => Promise<void>;
  markPlanViewed: () => Promise<void>;
  reset: () => void;
}

async function checkIsNewPlan(
  assignment: TrainingPlanAssignmentInterface,
): Promise<boolean> {
  try {
    const viewedId = await storageService.get(VIEWED_KEY);
    if (viewedId === String(assignment.id)) return false;
    const createdAt = new Date(assignment.created_at).getTime();
    return Date.now() - createdAt < SEVEN_DAYS_MS;
  } catch {
    return false;
  }
}

export const useTrainingPlanStore = create<TrainingPlanState>((set, get) => ({
  assignment: null,
  plan: null,
  phases: [],
  isLoading: false,
  error: null,
  hasNewPlan: false,

  fetchTrainingPlan: async () => {
    const hadData = get().plan !== null;
    if (!hadData) {
      set({ isLoading: true, error: null });
    }
    try {
      const response = await trainingPlanService.getMyTrainingPlan();
      if (response) {
        const isNew = await checkIsNewPlan(response.assignment);
        set({
          assignment: response.assignment,
          plan: response.plan,
          phases: response.phases ?? [],
          isLoading: false,
          error: null,
          hasNewPlan: isNew,
        });
      } else {
        set({
          assignment: null,
          plan: null,
          phases: [],
          isLoading: false,
          error: null,
          hasNewPlan: false,
        });
      }
    } catch {
      // Only show error if no data was ever loaded
      if (!hadData) {
        set({ isLoading: false, error: 'Failed to load training plan.' });
      } else {
        set({ isLoading: false });
      }
    }
  },

  /** Silent refresh — keeps existing data, no loading/error changes on failure. */
  refreshTrainingPlan: async () => {
    try {
      const response = await trainingPlanService.getMyTrainingPlan();
      if (response) {
        const isNew = await checkIsNewPlan(response.assignment);
        set({
          assignment: response.assignment,
          plan: response.plan,
          phases: response.phases ?? [],
          error: null,
          hasNewPlan: isNew,
        });
      } else {
        set({
          assignment: null,
          plan: null,
          phases: [],
          error: null,
          hasNewPlan: false,
        });
      }
    } catch {
      // Silent fail — keep existing data
    }
  },

  markPlanViewed: async () => {
    const { assignment } = get();
    if (!assignment) return;
    try {
      await storageService.set(VIEWED_KEY, String(assignment.id));
      set({ hasNewPlan: false });
    } catch {
      // Non-critical — badge may persist until next fetch
    }
  },

  reset: () =>
    set({
      assignment: null,
      plan: null,
      phases: [],
      isLoading: false,
      error: null,
      hasNewPlan: false,
    }),
}));
