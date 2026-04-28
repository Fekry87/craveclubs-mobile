/* ═══ Notification Types ═══ */

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  data: AppNotification[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    unread_count: number;
  };
}

export interface PushTokenPayload {
  token: string;
  device_type: 'ios' | 'android';
}
