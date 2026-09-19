/**
 * How often a plan's member trains. Mirrors SubscriptionPlan::TRAINING_TYPES on
 * the backend; the order is the tab order on the plan step.
 */
import i18n from '../i18n';

export const TRAINING_TYPES = ['daily', 'two_days', 'three_days', 'private'] as const;

export type TrainingType = (typeof TRAINING_TYPES)[number];

const isTrainingType = (value: string): value is TrainingType =>
  (TRAINING_TYPES as readonly string[]).includes(value);

/** Short label for a tab or a pill. Unknown types (a newer backend) show as sent. */
export const trainingTypeTab = (type: string | null | undefined): string =>
  type && isTrainingType(type) ? i18n.t(`trainingTypes.${type}.tab`, { ns: 'common' }) : type || '';

/** Full label for a sentence, e.g. on the review and the profile. */
export const trainingTypeLabel = (type: string | null | undefined): string =>
  type && isTrainingType(type) ? i18n.t(`trainingTypes.${type}.full`, { ns: 'common' }) : type || '';

/** The types that appear in `items`, in tab order, unknown ones last. */
export const trainingTypesIn = <T extends { training_type: string }>(items: T[]): string[] => {
  const present = new Set(items.map((i) => i.training_type));
  const known = TRAINING_TYPES.filter((t) => present.has(t));
  const unknown = [...present].filter((t) => !isTrainingType(t));
  return [...known, ...unknown];
};
