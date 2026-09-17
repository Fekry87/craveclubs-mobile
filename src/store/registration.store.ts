import { create } from 'zustand';

export interface BasicProfile {
  fullName: string;
  phone: string;
  /** Becomes the account's login address once the club approves. */
  email: string;
  gender: 'male' | 'female' | null;
  birthDate: string | null;
  avatarUrl: string | null;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
}

export interface PhysicalInfo {
  heightCm: number;
  weightKg: number;
  fitnessLevel: 'excellent' | 'good' | 'average' | 'beginner' | null;
  priorExperience: boolean | null;
  medicalNotes: string;
}

export interface Experience {
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional' | null;
  yearsExperience: string | null;
  competed: boolean | null;
  primaryGoal: string | null;
}

interface RegistrationState {
  step: number;
  email: string;
  password: string;
  clubSlug: string | null;
  clubName: string | null;
  basicProfile: BasicProfile;
  physicalInfo: PhysicalInfo;
  sportIds: string[];
  experience: Experience;
  branchId: number | null;
  branchName: string | null;
  planId: number | null;
  planName: string | null;
  planPrice: number | null;
  planTrainingType: string | null;
  coachId: number | null;
  coachName: string | null;
  groupId: number | null;
  groupName: string | null;
  groupType: string | null;
  /** "Sun, Tue, Thu · 5:00 PM – 6:30 PM", for the review and the success screen. */
  groupSchedule: string | null;
  preferredTime: string | null;
  isDraft: boolean;

  // Actions
  setClub: (slug: string, name: string) => void;
  setStep: (step: number) => void;
  updateCredentials: (data: { email?: string; password?: string }) => void;
  updateBasicProfile: (data: Partial<BasicProfile>) => void;
  updatePhysicalInfo: (data: Partial<PhysicalInfo>) => void;
  setSportIds: (ids: string[]) => void;
  updateExperience: (data: Partial<Experience>) => void;
  setBranch: (id: number, name: string) => void;
  setPlan: (id: number, name: string, price: number, trainingType: string) => void;
  setCoach: (id: number, name: string) => void;
  setGroup: (id: number, name: string, type: string, schedule: string | null) => void;
  clearGroup: () => void;
  setPreferredTime: (time: string) => void;
  setIsDraft: (val: boolean) => void;
  resetRegistration: () => void;
}

const initialState = {
  step: 1,
  email: '',
  password: '',
  clubSlug: null as string | null,
  clubName: null as string | null,
  basicProfile: {
    fullName: '',
    phone: '',
    email: '',
    gender: null as 'male' | 'female' | null,
    birthDate: null as string | null,
    avatarUrl: null as string | null,
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
  },
  physicalInfo: {
    heightCm: 170,
    weightKg: 70,
    fitnessLevel: null as 'excellent' | 'good' | 'average' | 'beginner' | null,
    priorExperience: null as boolean | null,
    medicalNotes: '',
  },
  sportIds: [] as string[],
  experience: {
    level: null as
      | 'beginner'
      | 'intermediate'
      | 'advanced'
      | 'professional'
      | null,
    yearsExperience: null as string | null,
    competed: null as boolean | null,
    primaryGoal: null as string | null,
  },
  branchId: null as number | null,
  branchName: null as string | null,
  planId: null as number | null,
  planName: null as string | null,
  planPrice: null as number | null,
  planTrainingType: null as string | null,
  coachId: null as number | null,
  coachName: null as string | null,
  groupId: null as number | null,
  groupName: null as string | null,
  groupType: null as string | null,
  groupSchedule: null as string | null,
  preferredTime: null as string | null,
  isDraft: false,
};

export const useRegistrationStore = create<RegistrationState>((set) => ({
  ...initialState,

  setClub: (clubSlug, clubName) => set({ clubSlug, clubName }),

  setStep: (step) => set({ step }),

  updateCredentials: (data) =>
    set((s) => ({
      email: data.email ?? s.email,
      password: data.password ?? s.password,
    })),

  updateBasicProfile: (data) =>
    set((s) => ({
      basicProfile: { ...s.basicProfile, ...data },
    })),

  updatePhysicalInfo: (data) =>
    set((s) => ({
      physicalInfo: { ...s.physicalInfo, ...data },
    })),

  setSportIds: (sportIds) => set({ sportIds }),

  updateExperience: (data) =>
    set((s) => ({
      experience: { ...s.experience, ...data },
    })),

  setBranch: (branchId, branchName) => set({ branchId, branchName }),
  setPlan: (planId, planName, planPrice, planTrainingType) =>
    set({ planId, planName, planPrice, planTrainingType }),
  // A group belongs to a coach, so choosing a different coach drops it.
  setCoach: (coachId, coachName) =>
    set((s) =>
      s.coachId === coachId
        ? { coachId, coachName }
        : { coachId, coachName, groupId: null, groupName: null, groupType: null, groupSchedule: null },
    ),
  setGroup: (groupId, groupName, groupType, groupSchedule) =>
    set({ groupId, groupName, groupType, groupSchedule }),
  clearGroup: () => set({ groupId: null, groupName: null, groupType: null, groupSchedule: null }),
  setPreferredTime: (preferredTime) => set({ preferredTime }),
  setIsDraft: (isDraft) => set({ isDraft }),

  resetRegistration: () => set(initialState),
}));
