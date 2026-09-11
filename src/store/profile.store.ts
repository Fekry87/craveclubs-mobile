import { create } from 'zustand';
import { profileService } from '../api/services/profile.service';
import { SwimmerProfileResponseType } from '../types/api.types';

interface ProfileState {
  data: SwimmerProfileResponseType | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  data: null,
  isLoading: false,
  error: null,
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  ...initialState,

  fetchProfile: async () => {
    const hasData = get().data !== null;
    if (!hasData) set({ isLoading: true });
    try {
      const data = await profileService.getProfile();
      set({ data, error: null, isLoading: false });
    } catch {
      // Keep stale data on refresh failures; only surface an error when empty
      set({
        isLoading: false,
        error: hasData ? null : 'Failed to load profile.',
      });
    }
  },

  reset: () => set(initialState),
}));
