import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { PaginatedResponseType } from '../../types/api.types';
import {
  SessionDetailInterface,
  TrainingSessionInterface,
} from '../../types/models.types';
import { localDateString } from '../../utils/formatters';

/**
 * Which sessions to list. The server filters, sorts and counts, so a tab never
 * depends on which pages happen to be loaded:
 * - upcoming: today onwards (incl. cancelled) + Live — soonest first
 * - completed: Completed + cancelled sessions whose day has passed — latest first
 * - today: every session on the device's today (Home)
 * - all: upcoming first, then the past
 */
export type SessionScope = 'all' | 'upcoming' | 'completed' | 'today';

export interface SessionCounts {
  all: number;
  upcoming: number;
  completed: number;
}

export interface SessionsPage extends PaginatedResponseType<TrainingSessionInterface> {
  /** Tab badge counts. Absent on backends older than scopes. */
  counts?: SessionCounts;
}

export const sessionService = {
  async getSessions(
    page: number = 1,
    perPage: number = 15,
    scope?: SessionScope,
  ): Promise<SessionsPage> {
    const { data } = await apiClient.get<SessionsPage>(ENDPOINTS.SWIMMER.SESSIONS, {
      params: {
        page,
        per_page: perPage,
        scope,
        // The server runs on UTC; "today" is the swimmer's local day.
        today: scope ? localDateString() : undefined,
      },
    });
    return data;
  },

  async getSessionDetail(id: number): Promise<SessionDetailInterface> {
    const { data } = await apiClient.get<SessionDetailInterface>(
      ENDPOINTS.SWIMMER.SESSION_DETAIL(id),
    );
    return data;
  },
};
