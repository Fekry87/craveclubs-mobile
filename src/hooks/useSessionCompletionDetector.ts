import { useRef, useCallback } from 'react';
import { TrainingSessionInterface } from '../types/models.types';
import { useSessionSummaryStore } from '../store/sessionSummary.store';

interface SessionSnapshot {
  id: number;
  status: TrainingSessionInterface['status'];
}

/**
 * Polling-based fallback for detecting session completions.
 * Compares previous session snapshots with current data to detect
 * when a session transitions from Live/Scheduled → Completed.
 *
 * Works immediately without WebSockets. When Reverb is enabled,
 * the useRealtime hook handles it via WebSocket events instead.
 */
export const useSessionCompletionDetector = () => {
  const previousSessionsRef = useRef<SessionSnapshot[] | null>(null);
  const { triggerRefreshForCompletion } = useSessionSummaryStore();

  const checkForCompletions = useCallback(
    (currentSessions: TrainingSessionInterface[]) => {
      const prevSessions = previousSessionsRef.current;

      // Store snapshot for next comparison
      previousSessionsRef.current = currentSessions.map((s) => ({
        id: s.id,
        status: s.status,
      }));

      // Skip first load — no previous data to compare
      if (!prevSessions) return;

      // Only check today's sessions
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      for (const current of currentSessions) {
        if (current.status !== 'Completed') continue;
        if (!current.date.startsWith(todayStr)) continue;

        const prev = prevSessions.find((p) => p.id === current.id);
        if (!prev) continue;

        // Detected transition: Live/Scheduled → Completed
        if (prev.status === 'Live' || prev.status === 'Scheduled') {
          triggerRefreshForCompletion(current.id);
          return; // Only trigger for the first detected completion
        }
      }
    },
    [triggerRefreshForCompletion],
  );

  return { checkForCompletions };
};
