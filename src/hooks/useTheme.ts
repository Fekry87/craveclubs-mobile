/**
 * useTheme — returns theme colors with dynamic primary/secondary from branding.
 *
 * Usage:
 *   const { colors, gradients } = useTheme();
 *   // colors.primary is the club's brand color (or default Pool Blue)
 *
 * For components that don't need dynamic colors (using only neutral/semantic
 * colors), the static `colors` import from `src/theme` is fine.
 */
import { useMemo } from 'react';
import { useBrandingStore } from '../store/branding.store';
import { toHex } from '../services/branding.service';
import { colors as defaultColors } from '../theme/colors';
import { gradients as defaultGradients } from '../theme/gradients';

/** Darken a hex color by ~15% */
function darkenHex(hex: string): string {
  const h = hex.replace('#', '');
  const r = Math.max(0, Math.round(parseInt(h.substring(0, 2), 16) * 0.85));
  const g = Math.max(0, Math.round(parseInt(h.substring(2, 4), 16) * 0.85));
  const b = Math.max(0, Math.round(parseInt(h.substring(4, 6), 16) * 0.85));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Create an rgba dim variant at 12% opacity */
function dimHex(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.12)`;
}

export type DynamicColors = typeof defaultColors;
/** Gradients with widened string types (dynamic colors aren't literal) */
export type DynamicGradients = Record<keyof typeof defaultGradients, readonly [string, string]>;

export interface ThemeValue {
  colors: DynamicColors;
  gradients: DynamicGradients;
}

export function useTheme(): ThemeValue {
  const primaryColor = useBrandingStore((s) => s.primaryColor);
  const secondaryColor = useBrandingStore((s) => s.secondaryColor);

  return useMemo(() => {
    const primary = toHex(primaryColor);
    const secondary = toHex(secondaryColor || 'CE82FF');

    const colors: DynamicColors = {
      ...defaultColors,
      primary,
      primaryDark: darkenHex(primary),
      primaryDim: dimHex(primary),
      secondary,
      secondaryDark: darkenHex(secondary),
      secondaryDim: dimHex(secondary),
    };

    const gradients: DynamicGradients = {
      ...defaultGradients,
      splash: [primary, defaultColors.swimmer] as const,
      avatar: [primary, secondary] as const,
      bar: [primary, defaultColors.swimmer] as const,
    };

    return { colors, gradients };
  }, [primaryColor, secondaryColor]);
}
