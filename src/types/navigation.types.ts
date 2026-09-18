export type AuthStackParamList = {
  Login: undefined;
};

import { NavigatorScreenParams } from '@react-navigation/native';

/* ═══ Swimmer Navigation ═══ */

export type AppTabParamList = {
  Home: undefined;
  Sessions: undefined;
  MyPlan: undefined;
  Progress: NavigatorScreenParams<ProgressStackParamList>;
  Leaderboard: undefined;
};

export type SessionsStackParamList = {
  SessionsList: undefined;
  SessionDetail: { sessionId: number };
};

export type ProgressStackParamList = {
  ProgressMain: undefined;
  Evaluations: undefined;
};

/* ═══ Coach Navigation ═══ */

export type CoachTabParamList = {
  CoachSessions: NavigatorScreenParams<CoachSessionsStackParamList>;
  CoachCalendar: undefined;
  CoachProfile: undefined;
};

export type CoachSessionsStackParamList = {
  CoachSessionsList: undefined;
  CoachSessionDetail: { sessionId: number };
  CoachSessionLive: { sessionId: number };
  CoachCreateSession: undefined;
  CoachSessionAttendance: { sessionId: number };
  /** قياس مجموعة: one stopwatch, several swimmers, a Finish per lane. */
  CoachGroupMeasurement: { sessionId: number };
};

/* ═══ Manager Navigation ═══ */

export type ManagerTabParamList = {
  ManagerAnalytics: undefined;
  ManagerCoaches: undefined;
  ManagerProfile: undefined;
};

/* ═══ Registration Flow ═══ */

export type RegistrationStackParamList = {
  Step1_BasicProfile: undefined;
  Step2_PhysicalInfo: undefined;
  Step3_SportType: undefined;
  Step4_ExperienceLevel: undefined;
  Step5_BranchSelection: undefined;
  Step6_SubscriptionPlan: undefined;
  Step7_CoachSelection: undefined;
  Step7b_GroupSelection: undefined;
  Step8_ReviewPayment: undefined;
  RegistrationSuccess: {
    swimmerName: string;
    branchName: string;
    coachName: string;
    planName: string;
    groupName?: string | null;
  };
};

/* ═══ Root ═══ */

export type RootStackParamList = {
  ClubEntry: undefined;
  Auth: undefined;
  SportSelect: undefined;
  App: NavigatorScreenParams<AppTabParamList> | undefined;
  NotificationCenter: undefined;
  /** The swimmer's Profile, opened from the header avatar (no longer a tab). */
  Profile: undefined;
  ChangePassword: undefined;
  /** Forced on first sign-in after approval or a reset; replaces the whole app until done. */
  SetPassword: undefined;
  Evaluations: undefined;
  SessionDetail: { sessionId: number };
  Registration: NavigatorScreenParams<RegistrationStackParamList> | undefined;
};
