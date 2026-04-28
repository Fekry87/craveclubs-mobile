export interface WeeklyReportEvaluation {
  session_id: number;
  date: string;
  session_title: string;
  present: boolean;
  rating: number | null;
  coach_notes: string | null;
}

export interface WeeklyReportPlanPhase {
  plan_name: string;
  phase_number: number;
  focus: string;
  week_start: number;
  week_end: number;
}

export interface WeeklyReport {
  week: string;
  week_start: string;
  week_end: string;
  sessions_scheduled: number;
  sessions_attended: number;
  sessions_missed: number;
  attendance_rate: number;
  avg_rating: number | null;
  evaluations: WeeklyReportEvaluation[];
  current_plan_phase: WeeklyReportPlanPhase | null;
}
