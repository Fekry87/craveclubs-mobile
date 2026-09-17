import type {
  BasicProfile,
  Experience,
  PhysicalInfo,
} from '../store/registration.store';

export type FieldErrors = Record<string, string>;

export type AboutYouValues = Omit<BasicProfile, 'avatarUrl' | 'photoData'>;
export type BodyValues = Pick<PhysicalInfo, 'heightCm' | 'weightKg' | 'fitnessLevel' | 'medicalNotes'>;
export type ExperienceValues = Pick<Experience, 'level' | 'primaryGoal'>;

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

// Shape only; the server validates properly. Enough to catch a phone number
// or a missing "@" before the swimmer gets to the review.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const ageFromBirthDate = (iso: string): number =>
  Math.floor((Date.now() - new Date(iso).getTime()) / YEAR_MS);

/*
 * One set of rules per section, shared by the step that first asks for the
 * answers and the review screen's edit sheet — so an edit can't save something
 * the step itself would have refused.
 */

export const validateAboutYou = (v: AboutYouValues): FieldErrors => {
  const errs: FieldErrors = {};
  if (v.fullName.trim().length < 2) {
    errs.fullName = 'Full name is required (min 2 characters)';
  }
  if (v.phone.replace(/\D/g, '').length < 10) {
    errs.phone = 'Valid phone number is required';
  }
  if (!EMAIL_RE.test(v.email.trim())) {
    errs.email = 'Enter a valid email address';
  }
  if (!v.gender) {
    errs.gender = 'Please select your gender';
  }
  if (!v.birthDate) {
    errs.birthDate = 'Date of birth is required';
  } else if (ageFromBirthDate(v.birthDate) < 5) {
    errs.birthDate = 'Swimmer must be at least 5 years old';
  }
  return errs;
};

export const validateBody = (v: BodyValues): FieldErrors =>
  v.fitnessLevel ? {} : { fitnessLevel: 'Please select your fitness level' };

export const validateExperience = (v: ExperienceValues): FieldErrors => {
  const errs: FieldErrors = {};
  if (!v.level) errs.level = 'Please select your skill level';
  if (!v.primaryGoal) errs.primaryGoal = 'Please select your main goal';
  return errs;
};

/** Trimmed copy of the About you answers, as they are stored. */
export const cleanAboutYou = (v: AboutYouValues): AboutYouValues => ({
  ...v,
  fullName: v.fullName.trim(),
  email: v.email.trim().toLowerCase(),
  guardianName: v.guardianName.trim(),
  guardianPhone: v.guardianPhone.trim(),
  guardianEmail: v.guardianEmail.trim(),
});

/*
 * Store → form. Steps and the review screen's edit sheets load their answers
 * with these, so they always start from what is saved.
 */

export const aboutFromStore = ({ avatarUrl: _avatar, photoData: _photo, ...answers }: BasicProfile): AboutYouValues =>
  answers;

export const bodyFromStore = (p: PhysicalInfo): BodyValues => ({
  heightCm: p.heightCm ?? 170,
  weightKg: p.weightKg ?? 70,
  fitnessLevel: p.fitnessLevel ?? null,
  medicalNotes: p.medicalNotes ?? '',
});

export const experienceFromStore = (e: Experience): ExperienceValues => ({
  level: e.level ?? null,
  primaryGoal: e.primaryGoal ?? null,
});
