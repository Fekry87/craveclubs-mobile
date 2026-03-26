import axios from 'axios';
import { storageService } from '../services/storage.service';
import { useBrandingStore } from '../store/branding.store';
import { apiUrl } from '../config/club';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || apiUrl;

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await storageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Attach club slug to every request — white-label binding
// Reads from branding store (works for both branded + shared builds)
apiClient.interceptors.request.use((config) => {
  const slug = useBrandingStore.getState().slug;
  if (slug) {
    config.headers['X-Club-Slug'] = slug;
  }

  // Attach sport module header when a module is selected
  // Lazy require to avoid circular dependency: client → store → service → client
  const { useSportModuleStore } = require('../store/sportModule.store');
  const { currentModule } = useSportModuleStore.getState();
  if (currentModule?.slug) {
    config.headers['X-Sport-Module'] = currentModule.slug;
  }

  return config;
});

let onUnauthorized: (() => void) | null = null;

export const setOnUnauthorized = (callback: () => void) => {
  onUnauthorized = callback;
};

let isLoggingOut = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !isLoggingOut) {
      // Prevent multiple simultaneous logout cascades
      isLoggingOut = true;
      await storageService.clearAll();
      onUnauthorized?.();
      // Reset after a short delay to allow re-login
      setTimeout(() => { isLoggingOut = false; }, 2000);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
