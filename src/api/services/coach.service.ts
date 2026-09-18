import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import {
  CoachDashboardResponseType,
  CoachSessionsResponseType,
  CoachSessionDetailResponseType,
  CoachRosterResponseType,
  CoachProfileResponseType,
  CoachSessionCompleteResponseType,
  CoachGroupsResponseType,
  CoachSessionCreateResponseType,
} from '../../types/api.types';
import {
  SessionCompletePayload,
  SessionCreatePayload,
  SessionAttendanceResponse,
  AwardType,
  SwimmerAwardInterface,
} from '../../types/models.types';
import { localDateString } from '../../utils/formatters';

/** A tab on the coach's Sessions screen. */
export type CoachSessionScope = 'all' | 'upcoming' | 'completed';

interface GiveAwardResponse {
  message: string;
  award: SwimmerAwardInterface;
}

export const coachService = {
  /* ═══ Dashboard ═══ */
  async getDashboard(): Promise<CoachDashboardResponseType> {
    const { data } = await apiClient.get<CoachDashboardResponseType>(
      ENDPOINTS.COACH.DASHBOARD,
    );
    return data;
  },

  /* ═══ Sessions ═══ */
  async getSessionsByMonth(
    year: number,
    month: number,
  ): Promise<CoachSessionsResponseType> {
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const { data } = await apiClient.get<CoachSessionsResponseType>(
      ENDPOINTS.COACH.SESSIONS,
      { params: { from, to, per_page: 100 } },
    );
    return data;
  },

  /**
   * One tab of the Sessions screen. The server filters, sorts and counts
   * (`scope` + the device's `today`), so a tab never depends on which pages
   * happen to be loaded — see session.service for the rules, they are shared.
   */
  async getSessions(
    page: number = 1,
    perPage: number = 20,
    scope: CoachSessionScope = 'all',
  ): Promise<CoachSessionsResponseType> {
    const { data } = await apiClient.get<CoachSessionsResponseType>(
      ENDPOINTS.COACH.SESSIONS,
      {
        params: {
          page,
          per_page: perPage,
          scope,
          // The server runs on UTC; "today" is the coach's local day.
          today: localDateString(),
        },
      },
    );
    return data;
  },

  async getSessionDetail(
    id: number,
  ): Promise<CoachSessionDetailResponseType> {
    const { data } = await apiClient.get<CoachSessionDetailResponseType>(
      ENDPOINTS.COACH.SESSION_DETAIL(id),
    );
    return data;
  },

  async createSession(
    payload: SessionCreatePayload,
  ): Promise<CoachSessionCreateResponseType> {
    const { data } = await apiClient.post<CoachSessionCreateResponseType>(
      ENDPOINTS.COACH.SESSIONS,
      payload,
    );
    return data;
  },

  async startSession(
    id: number,
  ): Promise<CoachSessionDetailResponseType> {
    const { data } = await apiClient.post<CoachSessionDetailResponseType>(
      ENDPOINTS.COACH.SESSION_START(id),
    );
    return data;
  },

  async completeSession(
    id: number,
    payload: SessionCompletePayload,
  ): Promise<CoachSessionCompleteResponseType> {
    const { data } = await apiClient.post<CoachSessionCompleteResponseType>(
      ENDPOINTS.COACH.SESSION_COMPLETE(id),
      payload,
    );
    return data;
  },

  async getSessionRoster(id: number): Promise<CoachRosterResponseType> {
    const { data } = await apiClient.get<CoachRosterResponseType>(
      ENDPOINTS.COACH.SESSION_ROSTER(id),
    );
    return data;
  },

  /* ═══ Attendance ═══ */
  async getSessionAttendance(
    id: number,
  ): Promise<SessionAttendanceResponse> {
    const { data } = await apiClient.get<SessionAttendanceResponse>(
      ENDPOINTS.COACH.SESSION_ATTENDANCE(id),
    );
    return data;
  },

  /* ═══ Groups ═══ */
  async getGroups(): Promise<CoachGroupsResponseType> {
    const { data } = await apiClient.get<CoachGroupsResponseType>(
      ENDPOINTS.COACH.GROUPS,
    );
    return data;
  },

  /* ═══ Awards ═══ */
  /**
   * Name a swimmer Man of the Day / Week / Month. The server answers 422 on
   * `swimmer_id` when the swimmer is not in one of this coach's groups.
   */
  async giveAward(
    swimmerId: number,
    awardType: AwardType,
  ): Promise<SwimmerAwardInterface> {
    const { data } = await apiClient.post<GiveAwardResponse>(
      ENDPOINTS.COACH.AWARDS,
      { swimmer_id: swimmerId, award_type: awardType },
    );
    return data.award;
  },

  /* ═══ Profile ═══ */
  async getProfile(): Promise<CoachProfileResponseType> {
    const { data } = await apiClient.get<CoachProfileResponseType>(
      ENDPOINTS.COACH.PROFILE,
    );
    return data;
  },

  async updateProfile(
    profileData: Record<string, string | null>,
  ): Promise<void> {
    await apiClient.put(ENDPOINTS.COACH.PROFILE, profileData);
  },
};
