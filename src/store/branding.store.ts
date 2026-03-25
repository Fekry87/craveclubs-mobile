import { create } from 'zustand';
import { isBrandedBuild, bakedSlug, bakedAppName, bakedPrimaryColor } from '../config/club';
import { brandingService, ClubBranding, toHex } from '../services/branding.service';
import { applyBrandingColors } from '../theme/colors';

interface BrandingState {
  /** Current club slug (baked-in for branded, user-selected for shared) */
  slug: string | null;
  /** App name shown in headers */
  appName: string;
  /** Primary brand color (with # prefix) */
  primaryColor: string;
  /** Secondary brand color (with # prefix) */
  secondaryColor: string;
  /** Remote branding data fetched from API */
  branding: ClubBranding | null;
  /** Whether branding has been resolved (branded = immediate, shared = after entry) */
  isResolved: boolean;
  /** Whether this is a branded (white-label) build */
  isBranded: boolean;

  /** Set slug for shared builds (from ClubEntryScreen) — fetches branding */
  setSlug: (slug: string) => Promise<void>;
  /** Restore persisted slug + cached branding on app launch */
  restoreSlug: () => Promise<void>;
  /** Update branding from API response */
  setBranding: (data: ClubBranding) => void;
  /** Force-refresh branding from API (bypasses cache) */
  refreshBranding: () => Promise<void>;
  /** Clear slug (for shared builds — switch club) */
  clearSlug: () => Promise<void>;
}

export const useBrandingStore = create<BrandingState>((set, get) => ({
  slug: bakedSlug,
  appName: bakedAppName,
  primaryColor: bakedPrimaryColor,
  secondaryColor: '#CE82FF',
  branding: null,
  isResolved: isBrandedBuild,
  isBranded: isBrandedBuild,

  setSlug: async (slug: string) => {
    await brandingService.setSlug(slug);
    set({ slug, isResolved: true });

    // Fetch branding in background
    try {
      const branding = await brandingService.fetchBranding(slug);
      get().setBranding(branding);
    } catch {
      // Non-critical — app can work with defaults
    }
  },

  restoreSlug: async () => {
    if (isBrandedBuild) {
      // Branded builds: always force-refresh branding on app launch
      if (bakedSlug) {
        try {
          const branding = await brandingService.fetchBranding(bakedSlug, true);
          get().setBranding(branding);
        } catch {
          // Non-critical
        }
      }
      return;
    }

    // Shared builds: restore persisted slug
    const saved = await brandingService.getStoredSlug();
    if (saved) {
      set({ slug: saved, isResolved: true });
      try {
        const branding = await brandingService.fetchBranding(saved, true);
        get().setBranding(branding);
      } catch {
        // Non-critical
      }
    }
  },

  setBranding: (data: ClubBranding) => {
    const primary = toHex(data.primaryColor);
    const secondary = toHex(data.secondaryColor || 'CE82FF');
    // Update the global colors object so all screens pick up branded colors
    applyBrandingColors(primary, secondary);
    set({
      branding: data,
      appName: data.appName || data.clubName || get().appName,
      primaryColor: primary,
      secondaryColor: secondary,
    });
  },

  refreshBranding: async () => {
    const slug = get().slug;
    if (!slug) return;
    try {
      const branding = await brandingService.fetchBranding(slug, true);
      get().setBranding(branding);
    } catch {
      // Non-critical
    }
  },

  clearSlug: async () => {
    await brandingService.clearSlug();
    set({
      slug: null,
      isResolved: false,
      branding: null,
      appName: 'CraveClubs',
      primaryColor: '#1CB0F6',
      secondaryColor: '#CE82FF',
    });
  },
}));
