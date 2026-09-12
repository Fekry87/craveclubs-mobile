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
  name: string;
  email: string;
  phone: string | null;
  specialization: string | null;
  bio: string | null;
  avatar_url: string | null;
  experience_years: number | null;
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
  weekly_frequency: string;
  branch_id: number;
  plan_id: number;
  coach_id: number;
  preferred_time: string;
  payment_method: 'cash';
  avatar_url?: string | null;
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
