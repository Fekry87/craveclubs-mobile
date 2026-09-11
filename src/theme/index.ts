import { Platform, ViewStyle } from 'react-native';
import { colors, onBrandingApplied } from './colors';

export { colors, applyBrandingColors, onBrandingApplied } from './colors';
export { gradients } from './gradients';
export { spacing } from './spacing';
export { typography, fontFamily } from './typography';
export { ANIMATION } from './animations';

export const borderRadius = {
  sm: 12,
  md: 14,
  card: 20,
  modal: 28,
  pill: 999,
};

/**
 * Cross-platform shadow system — intentionally faint.
 *
 * iOS: soft lavender-tinted diffusion, barely visible.
 * Android: near-zero elevation — surfaces rely on hairline borders
 *          for definition rather than elevation shadows.
 */
export const shadows: Record<string, ViewStyle> = {
  sm: Platform.select({
    ios: {
      shadowColor: '#3D3A6B',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
    },
    android: {
      elevation: 1,
      shadowColor: '#3D3A6B',
    },
  }) as ViewStyle,

  md: Platform.select({
    ios: {
      shadowColor: '#3D3A6B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
      shadowColor: '#3D3A6B',
    },
  }) as ViewStyle,

  lg: Platform.select({
    ios: {
      shadowColor: '#3D3A6B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.10,
      shadowRadius: 24,
    },
    android: {
      elevation: 4,
      shadowColor: '#3D3A6B',
    },
  }) as ViewStyle,

  /** Card shadow — hairline border does most of the work */
  card: Platform.select({
    ios: {
      shadowColor: '#3D3A6B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 14,
    },
    android: {
      elevation: 0,
      shadowColor: '#3D3A6B',
    },
  }) as ViewStyle,

  /** Legacy — kept for API compatibility; no longer used by tab bars */
  glow: Platform.select({
    ios: {
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 0,
    },
  }) as ViewStyle,
};

export const buttonShadows = {
  primary: Platform.select({
    ios: {
      shadowColor: colors.primaryDark,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 14,
    },
    android: {
      elevation: 2,
      shadowColor: colors.primaryDark,
    },
  }) as ViewStyle,
  swimmer: Platform.select({
    ios: {
      shadowColor: colors.swimmerDark,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 14,
    },
    android: {
      elevation: 2,
      shadowColor: colors.swimmerDark,
    },
  }) as ViewStyle,
  danger: Platform.select({
    ios: {
      shadowColor: colors.errorDark,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 14,
    },
    android: {
      elevation: 2,
      shadowColor: colors.errorDark,
    },
  }) as ViewStyle,
};

// Keep button shadows in sync with branded colors.
// danger stays on errorDark (semantic, not brand-dependent).
onBrandingApplied(() => {
  buttonShadows.primary.shadowColor = colors.primaryDark;
  buttonShadows.swimmer.shadowColor = colors.swimmerDark;
});
