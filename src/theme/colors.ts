import { applyBrandingToGradients } from './gradients';

/** Darken a hex color by ~15% */
function darken(hex: string): string {
  const h = hex.replace('#', '');
  const r = Math.max(0, Math.round(parseInt(h.substring(0, 2), 16) * 0.85));
  const g = Math.max(0, Math.round(parseInt(h.substring(2, 4), 16) * 0.85));
  const b = Math.max(0, Math.round(parseInt(h.substring(4, 6), 16) * 0.85));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Create rgba at 12% opacity */
function dim(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.12)`;
}

/**
 * Design language: calm, premium, single-accent (Ahead-inspired).
 * One primary drives buttons, active states, links and progress.
 * Everything else is neutral or a soft tint of a semantic color.
 */
/* eslint-disable prefer-const */
export let colors = {
  // Canvas — soft lavender-white, pure white surfaces
  background: '#F7F6FB',
  backgroundAlt: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceLight: '#F1F0F7',
  surfaceHover: '#E9E7F3',

  // Primary — violet platform default (overridden per club by branding)
  primary: '#6C4CF5',
  primaryDark: '#5A3EE0',
  primaryDim: 'rgba(108, 76, 245, 0.12)',

  // Swimmer — calm green (attendance / completed)
  swimmer: '#2FBF71',
  swimmerDark: '#27A360',
  swimmerDim: 'rgba(47, 191, 113, 0.12)',

  // Secondary — coral accent (overridden per club by branding)
  secondary: '#FF6F91',
  secondaryDark: '#E05E7C',
  secondaryDim: 'rgba(255, 111, 145, 0.12)',

  // Text — near-black navy on light
  text: '#1B1B2F',
  textMuted: '#6F6F84',
  textDim: '#A8A8BC',

  // Semantic
  success: '#2FBF71',
  successDim: 'rgba(47, 191, 113, 0.12)',
  warning: '#FFB020',
  warningDark: '#E29A12',
  warningDim: 'rgba(255, 176, 32, 0.14)',
  error: '#F04A5E',
  errorDark: '#D63C50',
  errorDim: 'rgba(240, 74, 94, 0.10)',

  // Borders — hairlines only
  border: '#E6E5EF',
  borderLight: '#EFEEF5',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Accents — illustration, hero cards, streaks (not brand-dependent)
  orange: '#FF8A4C',
  orangeDark: '#E6763D',
  orangeDim: 'rgba(255, 138, 76, 0.12)',
  pink: '#F472B6',
  pinkDim: 'rgba(244, 114, 182, 0.12)',
  teal: '#2CC4B0',
  tealDim: 'rgba(44, 196, 176, 0.12)',
};

type BrandingListener = () => void;
const brandingListeners: BrandingListener[] = [];

/**
 * Register a callback that runs whenever branding colors are applied.
 * Used by theme/index.ts to keep buttonShadows in sync without a
 * circular import (index.ts imports colors.ts).
 */
export function onBrandingApplied(listener: BrandingListener): void {
  brandingListeners.push(listener);
}

/**
 * Apply branding colors globally — mutates the colors object in-place
 * so every screen that imports `colors` gets the branded values.
 * Also re-derives brand-dependent gradients and notifies listeners
 * (button shadows). Neutral/semantic colors (grays, error, warning,
 * success, accents) are intentionally untouched.
 */
export function applyBrandingColors(primary: string, secondary: string): void {
  colors.primary = primary;
  colors.primaryDark = darken(primary);
  colors.primaryDim = dim(primary);
  colors.secondary = secondary;
  colors.secondaryDark = darken(secondary);
  colors.secondaryDim = dim(secondary);

  applyBrandingToGradients(colors.primary, colors.swimmer, colors.secondary);
  brandingListeners.forEach((listener) => listener());
}
