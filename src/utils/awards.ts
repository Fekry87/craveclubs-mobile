import { AwardType } from '../types/models.types';
import { IconName } from '../components/common/Icon';

/**
 * Man of the Day / Week / Month — the award's own name, as the portal and the
 * club's settings page call it. The name is the product's; the celebration
 * copy around it is built from the swimmer's name so it reads for everyone.
 */
export const AWARD_LABELS: Record<AwardType, string> = {
  day: 'Man of the Day',
  week: 'Man of the Week',
  month: 'Man of the Month',
};

/** Short form for pills and chips. */
export const AWARD_SHORT_LABELS: Record<AwardType, string> = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
};

export const AWARD_ICONS: Record<AwardType, IconName> = {
  day: 'medal-fill',
  week: 'award-fill',
  month: 'vip-crown-fill',
};

/** What the coach reads while choosing. */
export const AWARD_HINTS: Record<AwardType, string> = {
  day: "Today's standout swimmer",
  week: "This week's standout swimmer",
  month: "This month's standout swimmer",
};

export const AWARD_TYPES: readonly AwardType[] = ['day', 'week', 'month'];

export const awardLabel = (type: AwardType): string =>
  AWARD_LABELS[type] ?? AWARD_LABELS.day;

export const awardIcon = (type: AwardType): IconName =>
  AWARD_ICONS[type] ?? AWARD_ICONS.day;

/** "Ali Hassan" → "Ali". */
export const firstNameOf = (fullName: string): string =>
  fullName.trim().split(/\s+/)[0] || fullName;

/** Only http(s) URLs are drawn; anything else falls back to the sea character. */
export const isRenderableAvatar = (url: string | null | undefined): url is string =>
  typeof url === 'string' && /^https?:\/\//.test(url);
