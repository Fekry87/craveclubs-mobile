import { useCallback } from 'react';
import { useAwardCelebrationStore } from '../store/awardCelebration.store';

/**
 * Polling-based detection of unseen awards (Man of the Day / Week / Month).
 *
 * The counterpart of `useSessionCompletionDetector`: the Home screen calls
 * `checkForAwards` from the same places it calls `checkForCompletions` (the
 * full fetch on focus / pull-to-refresh and the silent poll), so awards ride
 * on the existing cadence instead of adding a timer of their own. When Reverb
 * is connected, `useRealtime` triggers the same store fetch on `.SwimmerAwarded`.
 */
export const useAwardCelebrationDetector = () => {
  const { fetchPending } = useAwardCelebrationStore();

  const checkForAwards = useCallback(() => {
    // The store swallows failures — never block the Home screen load.
    void fetchPending();
  }, [fetchPending]);

  return { checkForAwards };
};
