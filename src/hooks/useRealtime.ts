import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useNotificationStore } from '../store/notification.store';
import { useSessionStore } from '../store/session.store';
import { useSessionSummaryStore } from '../store/sessionSummary.store';
import { useAwardCelebrationStore } from '../store/awardCelebration.store';
import {
  initializeEcho,
  getEchoInstance,
} from '../services/echo.service';
import { storageService } from '../services/storage.service';

/**
 * Hook for subscribing to real-time events via Laravel Reverb.
 * Listens on `private-swimmer.{user.id}` for:
 * - SessionCompleted  → Refresh sessions + show summary popup
 * - SessionCancelled  → Refresh sessions + in-app alert with the reason
 * - NewSessionAssigned → Refresh sessions + notification
 * - CoachMessage       → Show in-app notification
 * - ScheduleChanged    → Refresh sessions + notification
 *
 * Also joins `private-club.{club_id}.members` (every member of the club) for:
 * - SwimmerAwarded     → Fetch the unseen awards so the celebration pops live
 *
 * Falls back gracefully when WebSocket is not available.
 */

interface SessionCancelledEvent {
  session_id: number;
  title: string | null;
  cancellation_reason: string | null;
}

interface SessionCompletedEvent {
  session_id: number;
  session_title: string;
  group_name: string;
}

interface CoachMessageEvent {
  message: string;
}

/** Callback to refresh dashboard data (set by HomeScreen) */
let dashboardRefreshCallback: (() => void) | null = null;

/** Register a callback from HomeScreen to refresh dashboard on real-time events */
export const setDashboardRefreshCallback = (cb: (() => void) | null) => {
  dashboardRefreshCallback = cb;
};

export const useRealtime = () => {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { refreshSessions } = useSessionStore();
  const { triggerRefreshForCompletion } = useSessionSummaryStore();
  const { fetchPending: fetchPendingAwards } = useAwardCelebrationStore();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (!user) return;

    const setup = async () => {
      const token = await storageService.getToken();
      if (!token || !mountedRef.current) return;

      const echo = initializeEcho(token);
      if (!echo) return; // WebSocket not available — polling fallback handles it

      const channel = echo.private(`swimmer.${user.id}`);

      channel.listen('.SessionCompleted', (data: SessionCompletedEvent) => {
        if (!mountedRef.current) return;
        refreshSessions();
        triggerRefreshForCompletion(data.session_id);
        addNotification({
          title: 'Session Complete!',
          message: `${data.session_title || 'Training session'} has ended.`,
          type: 'success',
        });
      });

      channel.listen('.SessionStarted', () => {
        if (!mountedRef.current) return;
        refreshSessions();
        addNotification({
          title: 'Session Started',
          message: 'Your training session is now live!',
          type: 'info',
        });
      });

      channel.listen('.SessionCancelled', (data: SessionCancelledEvent) => {
        if (!mountedRef.current) return;
        refreshSessions();
        addNotification({
          title: 'Session cancelled',
          message: data.cancellation_reason
            ? `${data.title || 'Your session'} was cancelled: ${data.cancellation_reason}`
            : `${data.title || 'Your session'} was cancelled.`,
          type: 'warning',
        });
      });

      // Catch-all for any session update (status change, reschedule, etc.)
      channel.listen('.SessionUpdated', () => {
        if (!mountedRef.current) return;
        refreshSessions();
      });

      channel.listen('.NewSessionAssigned', () => {
        if (!mountedRef.current) return;
        refreshSessions();
        addNotification({
          title: 'New Session',
          message: 'A new training session has been assigned to you.',
          type: 'info',
        });
      });

      channel.listen('.ProgressUpdated', () => {
        if (!mountedRef.current) return;
        // Progress screen refreshes on focus via useFocusEffect
      });

      channel.listen('.CoachMessage', (data: CoachMessageEvent) => {
        if (!mountedRef.current) return;
        addNotification({
          title: 'Coach Message',
          message: data.message,
          type: 'info',
        });
      });

      channel.listen('.ScheduleChanged', () => {
        if (!mountedRef.current) return;
        refreshSessions();
        addNotification({
          title: 'Schedule Updated',
          message: 'Your training schedule has been updated.',
          type: 'warning',
        });
      });

      // Attendance recorded by coach → refresh sessions (attendances field) + dashboard
      channel.listen('.AttendanceRecorded', () => {
        if (!mountedRef.current) return;
        refreshSessions();
        dashboardRefreshCallback?.();
      });

      // Evaluation added by coach → refresh sessions + dashboard
      channel.listen('.EvaluationAdded', () => {
        if (!mountedRef.current) return;
        refreshSessions();
        dashboardRefreshCallback?.();
        addNotification({
          title: 'New Evaluation',
          message: 'Your coach has added a new evaluation.',
          type: 'success',
        });
      });

      // Club-wide: someone was named Man of the Day / Week / Month. The
      // payload carries no avatar or `is_mine`, so the queue is refetched
      // rather than built from the event.
      const clubChannel = echo.private(`club.${user.club_id}.members`);
      clubChannel.listen('.SwimmerAwarded', () => {
        if (!mountedRef.current) return;
        fetchPendingAwards();
      });
    };

    setup();

    return () => {
      mountedRef.current = false;
      const echo = getEchoInstance();
      if (echo && user) {
        echo.leave(`swimmer.${user.id}`);
        echo.leave(`club.${user.club_id}.members`);
      }
    };
  }, [user, addNotification, refreshSessions, triggerRefreshForCompletion, fetchPendingAwards]);
};
