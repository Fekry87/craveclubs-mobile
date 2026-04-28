export interface ClubInterface {
  id: number;
  name: string;
  slug: string;
}

export interface FeaturesInterface {
  leaderboard_enabled: boolean;
  evaluations_enabled: boolean;
  skills_enabled: boolean;
  training_plans_enabled: boolean;
  attendance_tracking_enabled: boolean;
  swimmer_accounts_enabled: boolean;
  coach_portal_enabled: boolean;
}

export interface UserInterface {
  id: number;
  name: string;
  email: string;
  role: 'SWIMMER' | 'COACH' | 'CLUB_MANAGER' | 'PLATFORM_ADMIN';
  club_id: number;
  club: ClubInterface;
  features: FeaturesInterface;
}

export interface SwimmerProfileInterface {
  id: number;
  club_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  level: string | null;
  date_of_birth: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  medical_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroupInterface {
  id: number;
  name: string;
  description: string | null;
}

export interface TrainingPlanInterface {
  id: number;
  title: string;
}

export interface TrainingSessionInterface {
  id: number;
  title: string | null;
  type: string;
  status: 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
  date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  notes: string | null;
  group: GroupInterface;
  plan: TrainingPlanInterface | null;
  attendances?: AttendanceInterface[];
}

export interface AttendanceInterface {
  id: number;
  swimmer_id: number;
  session_id: number;
  present: boolean;
  created_at: string;
}

export interface EvaluationInterface {
  id: number;
  swimmer_id: number;
  session_id: number;
  rating: number;
  notes: string | null;
  created_at: string;
  session: {
    id: number;
    date: string;
    group: GroupInterface;
  };
}

export interface MonthlyRatingInterface {
  month: string;
  avg_rating: number;
  count: number;
}

export interface DailyRatingType {
  date: string;
  dayNumber: number;
  dayLabel: string;
  rating: number | null;
  count: number;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export interface LeaderboardEntryInterface {
  swimmer_id: number;
  first_name: string;
  last_initial: string;
  full_name?: string;
  rank: number;
  total_xp: number;
  level: number;
  level_name: string;
  level_color: string;
  is_current_user: boolean;
}

export interface XpBreakdownInterface {
  total_xp: number;
  rating_xp: number;
  attendance_xp: number;
  streak_xp: number;
  evaluation_count: number;
  attended_count: number;
}

export interface LevelInfoInterface {
  level: number;
  name: string;
  color: string;
  xp_to_next: number;
  next_level_name: string;
  next_level_xp: number;
  progress: number;
}

export interface LevelTierInterface {
  level: number;
  name: string;
  xp: number;
  color: string;
  icon: string;
}

/* ═══ Training Plan Types ═══ */

export interface TrainingPlanItemInterface {
  id: number;
  plan_id: number;
  sort_order: number;
  stroke: string;
  drill: string | null;
  distance: string | number;
  reps: number;
  interval: string;
  notes: string | null;
}

// Phase exercises come from a JSON column — simpler structure than plan items
export interface PhaseExerciseInterface {
  name: string;
  sets: number;
  reps: number;
  notes: string | null;
}

export interface TrainingPlanDetailInterface {
  id: number;
  title: string;
  level: string | null;
  description: string | null;
  duration_weeks: number;
  duration_unit: string;
  sessions_per_week: number;
  goals: string | null;
  difficulty_level: string;
  is_template: boolean;
  phases: TrainingPlanPhaseData[] | null;
  items: TrainingPlanItemInterface[];
}

export interface TrainingPlanPhaseData {
  week_start: number;
  week_end: number;
  focus: string;
  exercises: PhaseExerciseInterface[];
}

export interface TrainingPlanAssignmentInterface {
  id: number;
  training_plan_id: number;
  swimmer_profile_id: number | null;
  group_id: number | null;
  start_date: string;
  end_date: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  coach_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SwimmerTrainingPlanResponse {
  assignment: TrainingPlanAssignmentInterface;
  plan: TrainingPlanDetailInterface;
  phases: TrainingPlanPhaseData[];
}

/* ═══ Coach Types ═══ */

export interface CoachProfileInterface {
  user: {
    id: number;
    name: string;
    email: string;
  };
  profile: {
    bio: string | null;
    specialization: string | null;
    phone: string | null;
  } | null;
}

export interface CoachGroupInterface {
  id: number;
  name: string;
  description: string | null;
  coach_user_id: number;
  swimmers_count: number;
  swimmers?: SwimmerProfileInterface[];
}

export interface CoachSessionInterface {
  id: number;
  title: string | null;
  type: string;
  status: 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
  date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  notes: string | null;
  summary_notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  group: GroupInterface;
  plan: TrainingPlanInterface | null;
  attendances?: AttendanceInterface[];
  evaluations?: EvaluationInterface[];
  group_evaluation?: {
    id: number;
    rating: number;
    notes: string | null;
  } | null;
  effective_roster?: SwimmerProfileInterface[];
}

export interface CoachDashboardInterface {
  groups: CoachGroupInterface[];
  today_sessions: CoachSessionInterface[];
  upcoming_sessions: CoachSessionInterface[];
  live_sessions: CoachSessionInterface[];
  stats: {
    total_groups: number;
    today_count: number;
    live_count: number;
    upcoming_count: number;
  };
}

export interface SessionCompletePayload {
  summary_notes?: string;
  attendance: Array<{ swimmer_id: number; present: boolean }>;
  evaluations: Array<{ swimmer_id: number; rating: number; notes?: string }>;
  group_evaluation?: { rating: number; notes?: string };
}

export interface CoachSessionsStatusCounts {
  all: number;
  Scheduled: number;
  Live: number;
  Completed: number;
  Cancelled: number;
}

/* ═══ Attendance Types ═══ */

export interface AttendanceRosterItem {
  swimmer_id: number;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  present: boolean;
  evaluated: boolean;
  rating: number | null;
  notes: string | null;
}

export interface SessionAttendanceResponse {
  session: {
    id: number;
    title: string | null;
    date: string;
    start_time: string;
    end_time: string;
    status: 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
    group: GroupInterface;
  };
  roster: AttendanceRosterItem[];
  summary: {
    total: number;
    present: number;
    absent: number;
    evaluated: number;
  };
}

export interface SessionCreatePayload {
  group_id: number;
  title?: string;
  type?: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  notes?: string;
  plan_id?: number;
}
