/**
 * BrandingService — fetches and caches club branding with a 1-minute TTL.
 *
 * Caching: AsyncStorage (non-sensitive, cosmetic data).
 * Token storage stays in SecureStore (handled by storage.service.ts).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from '../config/club';

/* ── Types ─────────────────────────────────────────────── */

export interface ClubBranding {
  clubName: string;
  appName: string;
  primaryColor: string;   // hex with # prefix, e.g. "#1CB0F6"
  secondaryColor: string; // hex with # prefix
  logoUrl: string | null;
  coverUrl: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  features: Record<string, boolean>;
}

interface CachedBranding {
  data: ClubBranding;
  cachedAt: number;
}

/* ── Constants ─────────────────────────────────────────── */

const SLUG_KEY = 'crave_club_slug';
const BRANDING_KEY = 'crave_club_branding';
const BRANDING_TTL = 60_000; // 1 minute in ms

/* ── Service ───────────────────────────────────────────── */

/**
 * Fetch branding for a club slug.
 * Returns cached data if fresh (< 1 min). Falls back to stale cache on error.
 * Pass forceRefresh=true to skip cache (e.g. after login).
 */
async function fetchBranding(slug: string, forceRefresh = false): Promise<ClubBranding> {
  // 1. Check cache (skip if force refresh)
  const cached = await getCachedBranding();
  if (!forceRefresh && cached && Date.now() - cached.cachedAt < BRANDING_TTL) {
    return cached.data;
  }

  // 2. Fetch from API
  try {
    const baseUrl = apiUrl || 'https://api.craveclubs.com';
    const res = await fetch(`${baseUrl}/api/v1/branding/${slug}`);

    if (!res.ok) {
      // If 404 and no cache → club not found
      if (!cached) {
        throw new Error('Club not found');
      }
      // Return stale cache on non-404 errors
      return cached.data;
    }

    const json = await res.json();
    const branding = normalizeBranding(json);

    // 3. Store in cache with timestamp
    await AsyncStorage.setItem(
      BRANDING_KEY,
      JSON.stringify({ data: branding, cachedAt: Date.now() } satisfies CachedBranding),
    );

    return branding;
  } catch (err) {
    // Network error — return stale cache if available
    if (cached) {
      return cached.data;
    }
    throw err;
  }
}

/**
 * Ensure a color string has a # prefix.
 * Handles null, undefined, empty, already-prefixed, and bare hex.
 */
export function toHex(color: string | null | undefined): string {
  if (!color) return '#1CB0F6';
  return color.startsWith('#') ? color : `#${color}`;
}

/**
 * Rewrite localhost URLs to use the actual API host.
 * Backend may return http://localhost:8000/storage/... which is unreachable from mobile devices.
 */
function fixAssetUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const baseUrl = apiUrl || 'https://api.craveclubs.com';
  // Replace http://localhost:PORT or http://127.0.0.1:PORT with actual API base
  return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, baseUrl);
}

/** Normalize raw API response into ClubBranding shape */
function normalizeBranding(json: Record<string, unknown>): ClubBranding {
  const data = (json.data ?? json) as Record<string, unknown>;
  return {
    clubName: String(data.club_name ?? data.clubName ?? ''),
    appName: String(data.app_name ?? data.appName ?? data.club_name ?? data.clubName ?? ''),
    primaryColor: toHex(String(data.primary_color ?? data.primaryColor ?? '1CB0F6')),
    secondaryColor: toHex(String(data.secondary_color ?? data.secondaryColor ?? 'CE82FF')),
    logoUrl: fixAssetUrl(data.logo_url as string ?? data.logoUrl as string ?? null),
    coverUrl: fixAssetUrl(data.cover_url as string ?? data.coverUrl as string ?? null),
    supportEmail: (data.support_email ?? data.supportEmail ?? null) as string | null,
    supportPhone: (data.support_phone ?? data.supportPhone ?? null) as string | null,
    features: (data.features ?? {}) as Record<string, boolean>,
  };
}

/** Read cached branding from AsyncStorage */
async function getCachedBranding(): Promise<CachedBranding | null> {
  try {
    const raw = await AsyncStorage.getItem(BRANDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedBranding;
  } catch {
    return null;
  }
}

/** Read persisted slug from AsyncStorage */
function getStoredSlug(): Promise<string | null> {
  return AsyncStorage.getItem(SLUG_KEY);
}

/** Persist slug and clear branding cache (forces fresh fetch) */
async function setSlug(slug: string): Promise<void> {
  await AsyncStorage.setItem(SLUG_KEY, slug);
  await AsyncStorage.removeItem(BRANDING_KEY);
}

/** Clear slug and branding cache (switch club) */
async function clearSlug(): Promise<void> {
  await AsyncStorage.multiRemove([SLUG_KEY, BRANDING_KEY]);
}

// Call brandingService.clearBrandingCache() from any screen
// during development to force fresh branding fetch on next render.
async function clearBrandingCache(): Promise<void> {
  await AsyncStorage.removeItem(BRANDING_KEY);
}

export const brandingService = {
  fetchBranding,
  getStoredSlug,
  setSlug,
  clearSlug,
  clearBrandingCache,
};
