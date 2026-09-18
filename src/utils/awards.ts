import { IconName } from '../components/common/Icon';

/** One trophy for every award; the club names the awards themselves now. */
export const AWARD_ICON: IconName = 'trophy-fill';

/** "Ali Hassan" → "Ali". */
export const firstNameOf = (fullName: string): string =>
  fullName.trim().split(/\s+/)[0] || fullName;

/** Only http(s) URLs are drawn; anything else falls back to the sea character. */
export const isRenderableAvatar = (url: string | null | undefined): url is string =>
  typeof url === 'string' && /^https?:\/\//.test(url);
