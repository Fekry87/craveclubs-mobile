export interface MembershipMonth {
  month: string;
  new: number;
  total: number;
}

export interface AttendanceWeek {
  week: string;
  rate: number;
  sessions: number;
}

export interface RetentionMetrics {
  retention_rate_30d: number;
  at_risk_count: number;
  churned_count: number;
  avg_attendance_rate: number;
}

export interface RegistrationFunnel {
  submitted_30d: number;
  approved_30d: number;
  rejected_30d: number;
  pending_now: number;
  approval_rate: number;
}

export interface CoachPerformanceSummary {
  coach_id: number;
  coach_name: string;
  groups_count: number;
  swimmers_count: number;
  sessions_30d: number;
  avg_attendance: number;
  avg_rating: number | null;
  at_risk_count: number;
  rank: number;
}

export interface ClubAnalytics {
  membership_growth: MembershipMonth[];
  retention: RetentionMetrics;
  attendance_trend: AttendanceWeek[];
  registration_funnel: RegistrationFunnel;
  generated_at: string;
}
