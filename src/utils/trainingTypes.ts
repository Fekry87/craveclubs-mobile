/**
 * How often a plan's member trains. Mirrors SubscriptionPlan::TRAINING_TYPES on
 * the backend; the order is the tab order on the plan step.
 */
export const TRAINING_TYPES = ['daily', 'two_days', 'three_days', 'private'] as const;

export type TrainingType = (typeof TRAINING_TYPES)[number];

const LABELS: Record<TrainingType, { tab: string; full: string }> = {
  daily: { tab: 'Daily', full: 'Daily training' },
  two_days: { tab: '2 days a week', full: 'Two days a week' },
  three_days: { tab: '3 days a week', full: 'Three days a week' },
  private: { tab: 'Private', full: 'Private training' },
};

const isTrainingType = (value: string): value is TrainingType =>
  (TRAINING_TYPES as readonly string[]).includes(value);

/** Short label for a tab or a pill. Unknown types (a newer backend) show as sent. */
export const trainingTypeTab = (type: string | null | undefined): string =>
  type && isTrainingType(type) ? LABELS[type].tab : type || '';

/** Full label for a sentence, e.g. on the review and the profile. */
export const trainingTypeLabel = (type: string | null | undefined): string =>
  type && isTrainingType(type) ? LABELS[type].full : type || '';

/** The types that appear in `items`, in tab order, unknown ones last. */
export const trainingTypesIn = <T extends { training_type: string }>(items: T[]): string[] => {
  const present = new Set(items.map((i) => i.training_type));
  const known = TRAINING_TYPES.filter((t) => present.has(t));
  const unknown = [...present].filter((t) => !isTrainingType(t));
  return [...known, ...unknown];
};
