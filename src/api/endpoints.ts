export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  ACCOUNT: {
    DELETE: '/account/delete',
    REACTIVATE: '/account/reactivate',
    DELETION_STATUS: '/account/deletion-status',
  },
  SWIMMER: {
    DASHBOARD: '/swimmer/dashboard',
    SESSIONS: '/swimmer/sessions',
    STATS: '/swimmer/stats',
    EVALUATIONS: '/swimmer/evaluations',
    LEADERBOARD: '/swimmer/leaderboard',
    TRAINING_PLAN: '/swimmer/training-plan',
    WEEKLY_REPORT: '/swimmer/weekly-report',
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
    CLUBS: '/clubs',
  },
  REGISTRATION: {
    BRANCHES: '/branches',
    SUBSCRIPTION_PLANS: '/subscription-plans',
    COACHES: '/coaches',
    COACH_SCHEDULE: (id: number) => `/coaches/${id}/schedule` as const,
    SUBMIT: '/registrations',
  },
} as const;
