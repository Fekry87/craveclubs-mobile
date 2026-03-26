import { create } from 'zustand';
import { CoachProfileInterface } from '../types/models.types';
import { coachService } from '../api/services/coach.service';

interface CoachProfileState {
  profile: CoachProfileInterface | null;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Record<string, string | null>) => Promise<void>;
  reset: () => void;
}

export const useCoachProfileStore = create<CoachProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,
  isUpdating: false,

  fetchProfile: async () => {
    const hadData = get().profile !== null;
    if (!hadData) {
      set({ isLoading: true, error: null });
    }
    try {
      const data = await coachService.getProfile();
      set({ profile: data, isLoading: false, error: null });
    } catch {
      if (!hadData) {
        set({ isLoading: false, error: 'Failed to load profile.' });
      } else {
        set({ isLoading: false });
      }
    }
  },

  reset: () => {
    set({ profile: null, isLoading: false, error: null, isUpdating: false });
  },

  updateProfile: async (data: Record<string, string | null>) => {
    set({ isUpdating: true, error: null });
    try {
      await coachService.updateProfile(data);
      // Re-fetch profile after update
      const updated = await coachService.getProfile();
      set({ profile: updated, isUpdating: false });
    } catch {
      set({ isUpdating: false, error: 'Failed to update profile.' });
    }
  },
}));
