import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

// ── Club ──────────────────────────────────────────────────────────
export interface Club {
  id: number;
  name: string;
  display_name: string;
  slug: string;
  primary_color: string | null;
  logo_url: string | null;
}

// ── Sport ─────────────────────────────────────────────────────────
export interface Sport {
  id: number;
  name: string;
}

// ── Sport Module ──────────────────────────────────────────────────
export interface SportModule {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
}

// ── Branch ────────────────────────────────────────────────────────
export interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  is_active: boolean;
}

// ── Subscription Plan ─────────────────────────────────────────────
export interface SubscriptionPlan {
  id: number;
  name: string;
  /** daily | two_days | three_days | private — see utils/trainingTypes. */
  training_type: string;
  /** List price before the discount. */
  price: string;
  duration_months: number;
  discount_percent: number;
  /** Price after discount_percent, computed server-side. Render this, not `price`. */
  final_price: number;
  is_popular: boolean;
}

// ── Coach ─────────────────────────────────────────────────────────
export interface Coach {
  id: number;
  /** The coach's users.id, which groups point at (coach_user_id). */
  user_id?: number;
  name: string;
  email: string;
  phone: string | null;
  specialization: string | null;
  bio: string | null;
  avatar_url: string | null;
  experience_years: number | null;
}

// ── Group ─────────────────────────────────────────────────────────
export interface Group {
  id: number;
  name: string;
  /** daily | two_days | three_days | private — see utils/trainingTypes. */
  group_type: string;
  coach_name: string | null;
  /** The coach's users.id — what Coach.user_id matches. */
  coach_user_id: number | null;
  /** 0 = Sunday … 6 = Saturday. */
  days_of_week: number[];
  /** "Sun", "Tue"… in the same order. */
  days_of_week_labels: string[];
  /** "17:00", or null when the club hasn't set a time. */
  start_time: string | null;
  end_time: string | null;
  /** Null = no limit. */
  capacity: number | null;
  /** Null when there is no limit. Counts current members. */
  remaining_spots: number | null;
  is_full: boolean;
}

export interface ScheduleSlot {
  day: string;
  start_time: string;
  end_time: string;
}

export interface CoachSchedule {
  coach_id: number;
  slots: ScheduleSlot[];
}

// ── Registration Payload ──────────────────────────────────────────
export interface RegistrationPayload {
  club_slug?: string;
  full_name: string;
  phone: string;
  /** The swimmer's own email; it becomes their login once approved. */
  email?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  gender: 'male' | 'female';
  birth_date: string;
  height_cm: number;
  weight_kg: number;
  fitness_level: string;
  prior_experience: boolean;
  medical_notes: string;
  sport_ids: string[];
  experience_level: string;
  years_experience: string;
  competed: boolean;
  primary_goal: string;
  /** Optional: filled from the plan's training type, so the profile's schedule line still reads. */
  weekly_frequency?: string;
  branch_id: number;
  plan_id: number;
  coach_id: number;
  /** The group chosen on the group step; approval puts the swimmer in it. */
  group_id?: number;
  preferred_time: string;
  payment_method: 'cash';
  avatar_url?: string | null;
  /** Step 1's optional photo as a data URL (512px square JPEG). */
  photo?: string | null;
}

export interface RegistrationResponse {
  message: string;
  registration_id: number;
  status: string;
}

// ── API Calls ─────────────────────────────────────────────────────

/**
 * Resolve the club name a swimmer typed to exactly one club.
 *
 * There is deliberately no "list all clubs" call: a swimmer at one club should
 * never be shown the others. Returns null when nothing matches — the server
 * matches exactly, so a near miss is a miss.
 */
export const lookupClub = async (query: string): Promise<Club | null> => {
  try {
    const response = await apiClient.get(ENDPOINTS.PUBLIC.CLUB_LOOKUP, {
      params: { q: query },
    });
    return response.data as Club;
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } }).response?.status;
    if (status === 404 || status === 422) return null;
    throw err;
  }
};

export const getSports = async (): Promise<Sport[]> => {
  const response = await apiClient.get(ENDPOINTS.PUBLIC.SPORTS);
  return response.data.data ?? response.data;
};

export const getClubSportModules = async (): Promise<SportModule[]> => {
  const response = await apiClient.get(ENDPOINTS.PUBLIC.SPORTS);
  const modules = response.data.data ?? response.data;
  return modules.map((mod: Sport & { slug?: string; icon?: string; color?: string }) => ({
    id: mod.id,
    name: mod.name,
    slug: mod.slug ?? mod.name.toLowerCase().replace(/\s+/g, '-'),
    icon: mod.icon ?? null,
    color: mod.color ?? null,
  }));
};

export const getBranches = async (): Promise<Branch[]> => {
  const response = await apiClient.get(ENDPOINTS.REGISTRATION.BRANCHES);
  return response.data.data ?? response.data;
};

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await apiClient.get(
    ENDPOINTS.REGISTRATION.SUBSCRIPTION_PLANS,
  );
  return response.data.data ?? response.data;
};

export const getCoaches = async (): Promise<Coach[]> => {
  const response = await apiClient.get(ENDPOINTS.REGISTRATION.COACHES);
  return response.data.data ?? response.data;
};

/**
 * The chosen coach's groups, for the group step.
 *
 * The server answers the whole club's groups grouped by type
 * (`{ daily: [...], two_days: [...] }`, or `{}` when there are none) and has
 * no coach filter, so the list is flattened and cut to the coach here: by
 * `coach_user_id` when the coaches list gave us the user id, by name as a
 * fallback for a backend that doesn't. The tabs are re-derived client-side
 * from `group_type` with trainingTypesIn().
 */
export const getGroups = async (clubSlug: string, coach: Pick<Coach, 'user_id' | 'name'>): Promise<Group[]> => {
  const all = await getClubGroups(clubSlug);
  return all.filter((g) =>
    coach.user_id != null ? g.coach_user_id === coach.user_id : g.coach_name === coach.name,
  );
};

/**
 * Every scheduled group of the club, flat. The plan and coach steps use it to
 * tell which training types and which coaches still have an open group.
 */
export const getClubGroups = async (clubSlug: string): Promise<Group[]> => {
  const response = await apiClient.get(ENDPOINTS.PUBLIC.CLUB_GROUPS(clubSlug));
  const grouped = (response.data.data ?? {}) as Record<string, Group[]> | Group[];
  return Array.isArray(grouped) ? grouped : Object.values(grouped).flat();
};

export const getCoachSchedule = async (
  coachId: number,
): Promise<CoachSchedule> => {
  const response = await apiClient.get(
    ENDPOINTS.REGISTRATION.COACH_SCHEDULE(coachId),
  );
  return response.data.data ?? response.data;
};

export const submitRegistration = async (
  payload: RegistrationPayload,
): Promise<RegistrationResponse> => {
  const response = await apiClient.post(
    ENDPOINTS.REGISTRATION.SUBMIT,
    payload,
  );
  return response.data;
};

// ── Errors ────────────────────────────────────────────────────────

/** What went wrong with a registration call, in words a swimmer can act on. */
export interface RegistrationProblem {
  message: string;
  /** The payload field the server refused, when it named one (e.g. `email`). */
  field?: string;
}

interface ValidationErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

const errorBody = (err: unknown): { status?: number; data?: ValidationErrorBody } => {
  const response = (err as { response?: { status?: number; data?: ValidationErrorBody } }).response;
  return { status: response?.status, data: response?.data };
};

/**
 * Turn a failed registration call into something the screen can show. A 422
 * carries the server's own field messages ("This email is already
 * registered…"), which are written for the swimmer; anything else gets a
 * generic line, since raw server errors must never reach the screen.
 */
export const describeRegistrationError = (err: unknown): RegistrationProblem => {
  const { status, data } = errorBody(err);
  if (status === 422 && data?.errors) {
    const [field, messages] = Object.entries(data.errors)[0] ?? [];
    if (field && messages?.[0]) return { field, message: messages[0] };
  }
  if (status === 429) {
    return { message: 'Too many attempts. Please wait a few minutes and try again.' };
  }
  if (status === 422 && data?.message) return { message: data.message };
  return { message: 'Something went wrong. Please try again.' };
};

/**
 * Ask whether the swimmer's email can still be used, before they fill in the
 * other seven steps. Resolves to the server's message when it can't (already
 * an account, or not an address), null when it can. Network failures throw.
 */
export const checkEmailAvailability = async (email: string): Promise<string | null> => {
  try {
    await apiClient.post(ENDPOINTS.REGISTRATION.CHECK_EMAIL, { email });
    return null;
  } catch (err: unknown) {
    const { status } = errorBody(err);
    if (status === 422) return describeRegistrationError(err).message;
    throw err;
  }
};
