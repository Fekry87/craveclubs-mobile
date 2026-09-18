export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  ACCOUNT: {
    DELETE: '/account/delete',
    REACTIVATE: '/account/reactivate',
    DELETION_STATUS: '/account/deletion-status',
  },
  SWIMMER: {
    DASHBOARD: '/swimmer/dashboard',
    PROFILE: '/swimmer/profile',
    // Upload (POST, base64 data URL) or remove (DELETE) the swimmer's own photo.
    PROFILE_PHOTO: '/swimmer/profile/photo',
    SESSIONS: '/swimmer/sessions',
    SESSION_DETAIL: (id: number) => `/swimmer/sessions/${id}` as const,
    STATS: '/swimmer/stats',
    EVALUATIONS: '/swimmer/evaluations',
    LEADERBOARD: '/swimmer/leaderboard',
    TRAINING_PLAN: '/swimmer/training-plan',
    WEEKLY_REPORT: '/swimmer/weekly-report',
    // القياس: the swimmer's own times, one entry per training day.
    MEASUREMENTS: '/swimmer/measurements',
    MEASUREMENTS_PROGRESS: '/swimmer/measurements/progress',
    // Man of the Day / Week / Month: the unseen queue, the dismissal, the hall of fame.
    AWARDS_PENDING: '/swimmer/awards/pending',
    AWARD_SEEN: (id: number) => `/swimmer/awards/${id}/seen` as const,
    AWARDS_RECENT: '/swimmer/awards/recent',
  },
  COACH: {
    DASHBOARD: '/coach/dashboard',
    SESSIONS: '/coach/sessions',
    SESSION_DETAIL: (id: number) => `/coach/sessions/${id}` as const,
    SESSION_START: (id: number) => `/coach/sessions/${id}/start` as const,
    SESSION_COMPLETE: (id: number) => `/coach/sessions/${id}/complete` as const,
    SESSION_ROSTER: (id: number) => `/coach/sessions/${id}/roster` as const,
    SESSION_ATTENDANCE: (id: number) => `/coach/sessions/${id}/attendance` as const,
    SESSION_ATTENDANCE_TOGGLE: (id: number, swimmerId: number) =>
      `/coach/sessions/${id}/attendance/${swimmerId}` as const,
    PROFILE: '/coach/profile',
    GROUPS: '/coach/groups',
    SWIMMERS: '/coach/swimmers',
    SWIMMER_DETAIL: (id: number) => `/coach/swimmers/${id}` as const,
    SWIMMER_EVALUATE: (id: number) =>
      `/coach/swimmers/${id}/evaluate` as const,
    // Give a swimmer in one of the coach's own groups an award.
    AWARDS: '/coach/awards',
    // القياس: the club's strokes and distances, and a session's timed swims.
    MEASUREMENT_OPTIONS: '/coach/measurement-options',
    SESSION_MEASUREMENTS: (sessionId: number) =>
      `/coach/sessions/${sessionId}/measurements` as const,
    SESSION_MEASUREMENT: (sessionId: number, measurementId: number) =>
      `/coach/sessions/${sessionId}/measurements/${measurementId}` as const,
  },
  CLUB: {
    ANALYTICS: '/club/analytics',
    COACHES_PERFORMANCE: '/club/coaches/performance',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    READ: (id: number) => `/notifications/${id}/read` as const,
    MARK_ALL_READ: '/notifications/mark-all-read',
    PUSH_TOKEN: '/notifications/push-token',
  },
  BRANDING: {
    GET: (slug: string) => `/branding/${slug}` as const,
  },
  PUBLIC: {
    SPORTS: '/public/sports',
    // Exact-match lookup, not a listing: the app never shows a swimmer the
    // other clubs on the platform.
    CLUB_LOOKUP: '/public/club-lookup',
    // The club's groups grouped by training type, with schedule and spots left.
    CLUB_GROUPS: (slug: string) => `/clubs/${slug}/groups` as const,
    BRANDING: '/public/branding',
  },
  REGISTRATION: {
    BRANCHES: '/branches',
    SUBSCRIPTION_PLANS: '/subscription-plans',
    COACHES: '/coaches',
    COACH_SCHEDULE: (id: number) => `/coaches/${id}/schedule` as const,
    SUBMIT: '/registrations',
    // Step 1 asks whether the email is free before the other seven steps.
    CHECK_EMAIL: '/registrations/check-email',
  },
} as const;
