import { useNotificationStore } from '../store/notification.store';

export const useNotification = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    loadMore,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotificationStore();

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    loadMore,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
};
