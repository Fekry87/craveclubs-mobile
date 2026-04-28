import { useAuthStore } from '../store/auth.store';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
    hasFeature: (feature: string): boolean => {
      if (!user?.features) return false;
      return (user.features as unknown as Record<string, boolean>)[feature] ?? false;
    },
  };
};
