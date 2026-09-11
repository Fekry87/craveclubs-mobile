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
  // Sent when a club is resolved so the backend enforces club membership
  // (rejects users who don't belong to this club's branded/shared build).
  club_slug?: string;
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
  // Backend now returns only 'pending_deletion' or a generic 'none' (privacy:
  // active / non-existent / purged are indistinguishable). Older values kept
  // for backward compatibility with any cached responses.
  | 'none'
  | 'active'
  | 'pending_deletion'
  | 'permanently_deleted'
  | 'not_found';

export interface DeletionStatusResponseType {
  status: DeletionStatusValue;
  days_remaining?: number;
  scheduled_purge_at?: string;
}

/* ═══ Swimmer Profile (GET /swimmer/profile) ═══ */

export interface SwimmerBranchInterface {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  working_hours: string | null;
}

export interface SwimmerCoachInterface {
  id: number;
  name: string;
  phone: string | null;
  specialization: string | null;
  experience_years: number | null;
  rating: number | null;
}

export interface SwimmerGroupSummaryInterface {
  id: number;
  name: string;
  coach_name: string | null;
}

export type SubscriptionStatus = 'active' | 'expiring' | 'expired';

export interface SwimmerSubscriptionInterface {
  plan_name: string;
  duration_months: number;
  price: number;
  started_at: string;
  ends_at: string;
  /** Negative when expired */
  days_left: number;
  /** 0–100, share of the plan elapsed */
  progress: number;
  status: SubscriptionStatus;
}

export interface SwimmerSignupInterface {
  primary_goal: string | null;
  weekly_frequency: string | null;
  preferred_time: string | null;
  experience_level: string | null;
  fitness_level: string | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  registered_at: string | null;
}

export interface SwimmerXpSummaryInterface {
  total_xp: number;
  rank: number;
  total_swimmers: number;
  current_streak: number;
  level: LevelInfoInterface;
}

export interface SwimmerProfileStatsInterface {
  attendance_rate: number;
  sessions_attended: number;
  total_sessions: number;
  average_rating: number | null;
  evaluation_count: number;
}

export interface SwimmerProfileResponseType {
  profile: SwimmerProfileInterface;
  member_since: string | null;
  branch: SwimmerBranchInterface | null;
  coach: SwimmerCoachInterface | null;
  groups: SwimmerGroupSummaryInterface[];
  subscription: SwimmerSubscriptionInterface | null;
  signup: SwimmerSignupInterface | null;
  xp: SwimmerXpSummaryInterface;
  stats: SwimmerProfileStatsInterface;
}

/* ═══ Change password (POST /auth/change-password) ═══ */

export interface ChangePasswordRequestType {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ChangePasswordResponseType {
  message: string;
}
