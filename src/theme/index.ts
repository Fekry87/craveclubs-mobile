import { Platform, ViewStyle } from 'react-native';

export { colors } from './colors';
export { gradients } from './gradients';
export { spacing } from './spacing';
export { typography, fontFamily } from './typography';
export { ANIMATION } from './animations';

export const borderRadius = {
  sm: 12,
  md: 16,
  card: 20,
  modal: 24,
  pill: 999,
};

/**
 * Cross-platform shadow system.
 *
 * iOS: uses shadowColor/Offset/Opacity/Radius for soft, diffused shadows.
 * Android: uses very low elevation for subtle depth — cards rely on
 *          borders (borderWidth + borderColor) for visual definition
 *          rather than heavy Android elevation shadows.
 */
export const shadows: Record<string, ViewStyle> = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: {
      elevation: 1,
      shadowColor: '#000000',
    },
  }) as ViewStyle,

  md: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
      shadowColor: '#000000',
    },
  }) as ViewStyle,

  lg: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: {
      elevation: 3,
      shadowColor: '#000000',
    },
  }) as ViewStyle,

  /** Soft card shadow — on Android relies on card border for definition */
  card: Platform.select({
    ios: {
      shadowColor: '#8993A4',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: {
      elevation: 0,
      shadowColor: '#8993A4',
    },
  }) as ViewStyle,

  /** Tab bar active icon glow — iOS only, invisible on Android */
  glow: Platform.select({
    ios: {
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
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
      shadowColor: '#1899D6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 0,
    },
    android: {
      elevation: 3,
      shadowColor: '#1899D6',
    },
  }) as ViewStyle,
  swimmer: Platform.select({
    ios: {
      shadowColor: '#46A302',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 0,
    },
    android: {
      elevation: 3,
      shadowColor: '#46A302',
    },
  }) as ViewStyle,
  danger: Platform.select({
    ios: {
      shadowColor: '#E53E3E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 0,
    },
    android: {
      elevation: 3,
      shadowColor: '#E53E3E',
    },
  }) as ViewStyle,
};
