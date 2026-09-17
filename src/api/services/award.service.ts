import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import {
  PendingAwardInterface,
  SwimmerAwardInterface,
} from '../../types/models.types';

interface AwardListResponse<T> {
  data: T[];
}

/**
 * Swimmer-facing side of Man of the Day / Week / Month.
 *
 * The celebration queue is per viewer and server-tracked: every swimmer in the
 * club sees each award once, and `markSeen` is what makes it stop coming back.
 * The hall of fame is club-wide and permanent. Giving an award is a coach
 * action and lives in `coachService.giveAward`.
 */
export const awardService = {
  /** Awards this viewer has not dismissed yet, oldest first (capped at 10). */
  async getPending(): Promise<PendingAwardInterface[]> {
    const { data } = await apiClient.get<AwardListResponse<PendingAwardInterface>>(
      ENDPOINTS.SWIMMER.AWARDS_PENDING,
    );
    return data.data ?? [];
  },

  /** Idempotent: dismissing the same award twice is harmless. */
  async markSeen(awardId: number): Promise<void> {
    await apiClient.post(ENDPOINTS.SWIMMER.AWARD_SEEN(awardId));
  },

  /** The club's last 30 awards, newest first, seen or not. */
  async getRecent(): Promise<SwimmerAwardInterface[]> {
    const { data } = await apiClient.get<AwardListResponse<SwimmerAwardInterface>>(
      ENDPOINTS.SWIMMER.AWARDS_RECENT,
    );
    return data.data ?? [];
  },
};
