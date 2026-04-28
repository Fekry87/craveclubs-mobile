/**
 * Club configuration — supports two tiers:
 *
 * 1. **Branded build**: EXPO_PUBLIC_CLUB_SLUG is baked in at build time
 *    via eas.json profile. Slug is fixed, ClubEntryScreen is skipped.
 *
 * 2. **Shared build**: No EXPO_PUBLIC_CLUB_SLUG env var. User enters
 *    their club slug on ClubEntryScreen at first launch.
 */

/** True when this is a branded (white-label) build with baked-in slug */
export const isBrandedBuild: boolean = !!process.env.EXPO_PUBLIC_CLUB_SLUG;

/** Baked-in slug for branded builds, or null for shared builds */
export const bakedSlug: string | null =
  process.env.EXPO_PUBLIC_CLUB_SLUG || null;

/** Baked-in app name for branded builds */
export const bakedAppName: string =
  process.env.EXPO_PUBLIC_APP_NAME ||
  process.env.EXPO_PUBLIC_CLUB_NAME ||
  'CraveClubs';

/** Baked-in primary color (with # prefix) */
export const bakedPrimaryColor: string = (() => {
  const raw = process.env.EXPO_PUBLIC_CLUB_PRIMARY_COLOR || process.env.EXPO_PUBLIC_PRIMARY_COLOR || '1CB0F6';
  return raw.startsWith('#') ? raw : `#${raw}`;
})();

/** API base URL — required for both tiers */
export const apiUrl: string =
  process.env.EXPO_PUBLIC_API_URL || 'https://api.craveclubs.com';

/**
 * Legacy clubConfig — kept for backward compatibility.
 * For branded builds this resolves immediately.
 * For shared builds, slug/name must be set at runtime via BrandingContext.
 */
export const clubConfig = {
  slug: process.env.EXPO_PUBLIC_CLUB_SLUG ?? '',
  name: process.env.EXPO_PUBLIC_CLUB_NAME ?? '',
  primaryColor: process.env.EXPO_PUBLIC_CLUB_PRIMARY_COLOR ?? '#1CB0F6',
  apiUrl,
} as const;

export type ClubConfig = typeof clubConfig;
