import {
  UserInterface,
  SwimmerProfileInterface,
  TrainingSessionInterface,
  EvaluationInterface,
  MonthlyRatingInterface,
  LeaderboardEntryInterface,
  XpBreakdownInterface,
  LevelInfoInterface,
  LevelTierInterface,
  CoachDashboardInterface,
  CoachSessionInterface,
  CoachProfileInterface,
  CoachSessionsStatusCounts,
  CoachGroupInterface,
} from './models.types';

export interface LoginRequestType {
  email: string;
  password: string;
}

export interface LoginResponseType {
  token: string;
  user: UserInterface;
}

export interface AuthMeResponseType {
  user: UserInterface;
}

export interface DashboardResponseType {
  profile: SwimmerProfileInterface;
  upcoming_sessions: TrainingSessionInterface[];
  attendance_rate: number | null;
  total_sessions: number;
  sessions_attended: number;
  recent_evaluations: EvaluationInterface[];
  average_rating: number | null;
  best_rating: number | null;
  monthly_ratings: MonthlyRatingInterface[];
}

export interface PaginatedResponseType<T> {
  current_page: number;
  data: T[];
  from: number | null;
  last_page: number;
  next_page_url: string | null;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface StatsResponseType {
  total_sessions: number;
  sessions_attended: number;
  attendance_rate: number | null;
  average_rating: number | null;
  best_rating: number | null;
  monthly_ratings: MonthlyRatingInterface[];
}

export interface LeaderboardResponseType {
  top5: LeaderboardEntryInterface[];
  all_rankings: LeaderboardEntryInterface[];
  my_rank: number;
  my_xp: XpBreakdownInterface;
  my_level: LevelInfoInterface;
  total_swimmers: number;
  levels: LevelTierInterface[];
}

export interface ApiErrorType {
  message: string;
  errors?: Record<string, string[]>;
}

/* ═══ Coach API Types ═══ */

export type CoachDashboardResponseType = CoachDashboardInterface;

export interface CoachSessionsResponseType {
  current_page: number;
  data: CoachSessionInterface[];
  last_page: number;
  per_page: number;
  total: number;
  status_counts: CoachSessionsStatusCounts;
}

export type CoachSessionDetailResponseType = CoachSessionInterface;

export interface CoachRosterResponseType {
  group_swimmers: SwimmerProfileInterface[];
  added_swimmers: Array<{ swimmer_id: number }>;
  excluded_swimmers: Array<{ swimmer_id: number }>;
  effective_roster: SwimmerProfileInterface[];
}

export type CoachProfileResponseType = CoachProfileInterface;

export interface CoachSessionCompleteResponseType {
  message: string;
  session: CoachSessionInterface;
}

export type CoachGroupsResponseType = CoachGroupInterface[];

export type CoachSessionCreateResponseType = CoachSessionInterface;

/* ═══ Account Deletion Types ═══ */

export interface DeleteAccountResponseType {
  message: string;
  scheduled_purge_at: string;
  days_remaining: number;
}

export interface ReactivateAccountRequestType {
  email: string;
  password: string;
}

export interface ReactivateAccountResponseType {
  message: string;
  token: string;
  user: UserInterface;
}

export type DeletionStatusValue =
  | 'active'
  | 'pending_deletion'
  | 'permanently_deleted'
  | 'not_found';

export interface DeletionStatusResponseType {
  status: DeletionStatusValue;
  days_remaining?: number;
  scheduled_purge_at?: string;
}
