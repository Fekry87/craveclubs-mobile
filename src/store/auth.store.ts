import { create } from 'zustand';
import * as Sentry from '@sentry/react-native';
import { UserInterface } from '../types/models.types';
import { authService } from '../api/services/auth.service';
import { storageService } from '../services/storage.service';
import { brandingService } from '../services/branding.service';
import { useBrandingStore } from './branding.store';
import { useCoachStore } from './coach.store';
import { useCoachProfileStore } from './coachProfile.store';
import { useSessionStore } from './session.store';
import { useNotificationStore } from './notification.store';
import { useTrainingPlanStore } from './trainingPlan.store';
import { useProfileStore } from './profile.store';
import { useSessionSummaryStore } from './sessionSummary.store';
import { useAwardCelebrationStore } from './awardCelebration.store';
import { useMeasurementStore } from './measurement.store';

interface AuthState {
  user: UserInterface | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginLoading: boolean;
  isDeletingAccount: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  setSession: (token: string, user: UserInterface) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  reactivateAccount: (email: string, password: string) => Promise<void>;
  restoreSession: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

/** Sync branding store with the authenticated user's club */
const syncBrandingFromUser = async (user: UserInterface) => {
  if (user.club?.slug) {
    await useBrandingStore.getState().setSlug(user.club.slug);
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isLoginLoading: false,
  isDeletingAccount: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoginLoading: true, error: null });
    try {
      // Include the resolved club slug so the backend enforces club membership
      // (branded builds + shared builds that have picked a club).
      const clubSlug = useBrandingStore.getState().slug ?? undefined;
      const response = await authService.login({ email, password, club_slug: clubSlug });
      await storageService.setToken(response.token);
      await storageService.setUserData(response.user);
      Sentry.setUser({ id: String(response.user.id), email: response.user.email });
      await syncBrandingFromUser(response.user);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoginLoading: false,
      });
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
        code?: string;
      };
      let message = 'Login failed. Please try again.';
      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (
        axiosError.code === 'ERR_NETWORK' ||
        axiosError.code === 'ECONNABORTED'
      ) {
        message = 'Cannot reach the server. Please check your connection.';
      }
      set({ isLoginLoading: false, error: message });
      throw error;
    }
  },

  setSession: async (token: string, user: UserInterface) => {
    await storageService.setToken(token);
    await storageService.setUserData(user);
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Proceed with local logout even if API call fails
    } finally {
      await storageService.clearAll();
      Sentry.setUser(null);
      // Reset all stores to prevent stale data on re-login
      useCoachStore.getState().reset();
      useCoachProfileStore.getState().reset();
      useSessionStore.getState().reset();
      useNotificationStore.getState().clearNotifications();
      useTrainingPlanStore.getState().reset();
      useSessionSummaryStore.getState().reset();
      useAwardCelebrationStore.getState().reset();
      useMeasurementStore.getState().reset();
      useProfileStore.getState().reset();
      await brandingService.clearBrandingCache();
      await useBrandingStore.getState().clearSlug();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  deleteAccount: async () => {
    set({ isDeletingAccount: true });
    try {
      await authService.deleteAccount();
    } finally {
      await storageService.clearAll();
      Sentry.setUser(null);
      useCoachStore.getState().reset();
      useCoachProfileStore.getState().reset();
      useSessionStore.getState().reset();
      useNotificationStore.getState().clearNotifications();
      useTrainingPlanStore.getState().reset();
      useSessionSummaryStore.getState().reset();
      useAwardCelebrationStore.getState().reset();
      useMeasurementStore.getState().reset();
      useProfileStore.getState().reset();
      await brandingService.clearBrandingCache();
      await useBrandingStore.getState().clearSlug();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isDeletingAccount: false,
        error: null,
      });
    }
  },

  reactivateAccount: async (email: string, password: string) => {
    set({ isLoginLoading: true, error: null });
    try {
      const response = await authService.reactivateAccount({ email, password });
      await storageService.setToken(response.token);
      await storageService.setUserData(response.user);
      Sentry.setUser({ id: String(response.user.id), email: response.user.email });
      await syncBrandingFromUser(response.user);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoginLoading: false,
      });
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
        code?: string;
      };
      let message = 'Reactivation failed. Please try again.';
      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (
        axiosError.code === 'ERR_NETWORK' ||
        axiosError.code === 'ECONNABORTED'
      ) {
        message = 'Cannot reach the server. Please check your connection.';
      }
      set({ isLoginLoading: false, error: message });
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const token = await storageService.getToken();
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const response = await authService.getMe();
      await storageService.setUserData(response.user);
      Sentry.setUser({ id: String(response.user.id), email: response.user.email });
      await syncBrandingFromUser(response.user);
      set({
        user: response.user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      await storageService.clearAll();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const current = get().user;
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPassword,
      });
    } catch (err: unknown) {
      // A 422 is a real refusal. Anything else (a 500, a dropped connection)
      // can arrive after the server already saved the new password — it
      // happened in production: the request failed, the password had
      // changed, and the swimmer was stuck on the set-password screen with a
      // temporary password that no longer worked. So before keeping the
      // gate up, ask the server whether it still wants a new password.
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 422 || !current?.must_change_password) throw err;
      let settled = false;
      try {
        const { user } = await authService.getMe();
        settled = !user.must_change_password;
        if (settled) {
          await storageService.setUserData(user);
          set({ user });
        }
      } catch {
        // Couldn't ask; the original failure stands.
      }
      if (!settled) throw err;
      return;
    }
    // The password is theirs now: lift the first-sign-in gate without a refetch.
    if (current?.must_change_password) {
      const user = { ...current, must_change_password: false };
      await storageService.setUserData(user);
      set({ user });
    }
  },

  clearError: () => set({ error: null }),
}));
