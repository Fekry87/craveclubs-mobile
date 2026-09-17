import { create } from 'zustand';
import { awardService } from '../api/services/award.service';
import { PendingAwardInterface } from '../types/models.types';

interface AwardCelebrationState {
  /** Unseen awards in the order they will be shown. */
  queue: PendingAwardInterface[];
  /** The award on screen right now; null when nothing is pending. */
  current: PendingAwardInterface | null;
  isLoading: boolean;
  /** Ask the server for unseen awards; fills the queue when there are any. */
  fetchPending: () => Promise<void>;
  /** Tell the server this viewer saw the current award, then show the next one. */
  dismissCurrent: () => Promise<void>;
  reset: () => void;
}

/**
 * Club-wide celebration queue (Man of the Day / Week / Month).
 *
 * Mirrors `sessionSummary.store.ts`: the store owns the fetch so that both the
 * Home screen's detector hook and the realtime listener can trigger it, and a
 * card that is already on screen is never replaced from under the swimmer.
 */
export const useAwardCelebrationStore = create<AwardCelebrationState>(
  (set, get) => ({
    queue: [],
    current: null,
    isLoading: false,

    fetchPending: async () => {
      // Don't interrupt an already visible card — the queue is rebuilt on the
      // next check, once this one has been dismissed.
      if (get().current || get().isLoading) return;

      set({ isLoading: true });
      try {
        const pending = await awardService.getPending();
        if (pending.length > 0) {
          set({ queue: pending, current: pending[0] });
        }
      } catch {
        // Silently fail — celebrations are never on the critical path
      } finally {
        set({ isLoading: false });
      }
    },

    dismissCurrent: async () => {
      const { current, queue } = get();
      if (!current) return;

      // Advance locally first: the card must not hang on a slow network.
      const rest = queue.slice(1);
      set({ queue: rest, current: rest[0] ?? null });

      try {
        await awardService.markSeen(current.award_id);
      } catch {
        // Not marked seen — the same award simply shows again on the next open
      }
    },

    reset: () => set({ queue: [], current: null, isLoading: false }),
  }),
);
