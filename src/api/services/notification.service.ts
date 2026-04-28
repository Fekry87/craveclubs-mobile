import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import {
  AppNotification,
  NotificationsResponse,
  PushTokenPayload,
} from '../../types/notification.types';

export const notificationApiService = {
  async getNotifications(page = 1): Promise<NotificationsResponse> {
    const { data } = await apiClient.get<NotificationsResponse>(
      ENDPOINTS.NOTIFICATIONS.LIST,
      { params: { page } },
    );
    return data;
  },

  async markAsRead(id: number): Promise<AppNotification> {
    const { data } = await apiClient.post<AppNotification>(
      ENDPOINTS.NOTIFICATIONS.READ(id),
    );
    return data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },

  async registerPushToken(payload: PushTokenPayload): Promise<void> {
    await apiClient.post(ENDPOINTS.NOTIFICATIONS.PUSH_TOKEN, payload);
  },
};
