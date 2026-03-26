import { create } from 'zustand';
import { AppNotification } from '../types/notification.types';
import { notificationApiService } from '../api/services/notification.service';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  lastPage: number;

  /* Actions */
  fetchNotifications: (page?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  /** Add a local notification from real-time events (WebSocket) */
  addNotification: (
    notification: {
      title: string;
      message: string;
      type: string;
      body?: string;
      data?: Record<string, unknown> | null;
    },
  ) => void;
  clearNotifications: () => void;
}

let localIdCounter = -1;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  currentPage: 1,
  lastPage: 1,

  fetchNotifications: async (page = 1) => {
    const hadData = get().notifications.length > 0;
    if (!hadData) {
      set({ isLoading: true, error: null });
    }
    try {
      const response = await notificationApiService.getNotifications(page);
      const items = Array.isArray(response.data)
        ? response.data
        : (response as unknown as { data: { data: AppNotification[] } }).data
            ?.data ?? [];
      set({
        notifications: items,
        unreadCount: response.meta?.unread_count ?? 0,
        currentPage: response.meta?.current_page ?? 1,
        lastPage: response.meta?.last_page ?? 1,
        isLoading: false,
        error: null,
      });
    } catch {
      if (!hadData) {
        set({ isLoading: false, error: 'Failed to load notifications' });
      } else {
        set({ isLoading: false });
      }
    }
  },

  loadMore: async () => {
    const { currentPage, lastPage, isLoading, notifications } = get();
    if (isLoading || currentPage >= lastPage) return;

    const nextPage = currentPage + 1;
    try {
      const response = await notificationApiService.getNotifications(nextPage);
      const items = Array.isArray(response.data) ? response.data : [];
      set({
        notifications: [...notifications, ...items],
        currentPage: nextPage,
        lastPage: response.meta?.last_page ?? lastPage,
      });
    } catch {
      // Silent fail on load more
    }
  },

  markAsRead: async (id: number) => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    try {
      await notificationApiService.markAsRead(id);
    } catch {
      // Silent fail — optimistic update stays; next manual refresh will sync
    }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        read_at: n.read_at ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    }));

    try {
      await notificationApiService.markAllAsRead();
    } catch {
      // Silent fail — optimistic update stays; next manual refresh will sync
    }
  },

  /**
   * Add a local notification from real-time WebSocket events.
   * Accepts the shape used by useRealtime: { title, message, type }.
   */
  addNotification: (notification) => {
    const localNotif: AppNotification = {
      id: localIdCounter--,
      type: notification.type,
      title: notification.title,
      body: notification.message ?? notification.body ?? '',
      data: notification.data ?? null,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [localNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
