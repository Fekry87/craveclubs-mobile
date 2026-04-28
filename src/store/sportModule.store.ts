import { create } from 'zustand';
import { SportModule, getClubSportModules } from '../api/services/registration.service';
import { storageService } from '../services/storage.service';

const STORAGE_KEY = 'current_sport_module';

interface SportModuleState {
  currentModule: SportModule | null;
  availableModules: SportModule[];
  isLoading: boolean;
  setCurrentModule: (module: SportModule) => Promise<void>;
  setAvailableModules: (modules: SportModule[]) => void;
  clearModule: () => Promise<void>;
  fetchAndInitModules: () => Promise<void>;
}

export const useSportModuleStore = create<SportModuleState>((set, get) => ({
  currentModule: null,
  availableModules: [],
  isLoading: false,

  setCurrentModule: async (module: SportModule) => {
    set({ currentModule: module });
    await storageService.set(STORAGE_KEY, JSON.stringify(module));
  },

  setAvailableModules: (modules: SportModule[]) => {
    set({ availableModules: modules });
  },

  clearModule: async () => {
    set({ currentModule: null, availableModules: [] });
    await storageService.remove(STORAGE_KEY);
  },

  fetchAndInitModules: async () => {
    set({ isLoading: true });
    try {
      const modules = await getClubSportModules();
      set({ availableModules: modules });

      // Restore persisted module if still valid
      const stored = await storageService.get(STORAGE_KEY);
      if (stored) {
        const parsed: SportModule = JSON.parse(stored);
        const stillValid = modules.some((m) => m.id === parsed.id);
        if (stillValid) {
          set({ currentModule: parsed, isLoading: false });
          return;
        }
      }

      // Auto-select if only one module available
      if (modules.length === 1) {
        await get().setCurrentModule(modules[0]);
      } else if (modules.length === 0) {
        await get().clearModule();
      }
    } catch {
      // Non-critical — app can work without sport module context
    } finally {
      set({ isLoading: false });
    }
  },
}));
