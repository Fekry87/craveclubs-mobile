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

/* eslint-disable prefer-const */
export let colors = {
  // Backgrounds (light, bright)
  background: '#F6F7FB',
  backgroundAlt: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceLight: '#F0F2F8',
  surfaceHover: '#E8EBF2',

  // Primary — Pool Blue
  primary: '#1CB0F6',
  primaryDark: '#1899D6',
  primaryDim: 'rgba(28, 176, 246, 0.12)',

  // Swimmer — Bright Green (Duolingo green)
  swimmer: '#58CC02',
  swimmerDark: '#46A302',
  swimmerDim: 'rgba(88, 204, 2, 0.12)',

  // Secondary — Purple Fun
  secondary: '#CE82FF',
  secondaryDark: '#B066E3',
  secondaryDim: 'rgba(206, 130, 255, 0.12)',

  // Text (dark on light)
  text: '#3C3C3C',
  textMuted: '#777777',
  textDim: '#AFAFAF',

  // Semantic
  success: '#58CC02',
  successDim: 'rgba(88, 204, 2, 0.12)',
  warning: '#FFC800',
  warningDark: '#E5B400',
  warningDim: 'rgba(255, 200, 0, 0.15)',
  error: '#FF4B4B',
  errorDark: '#E53E3E',
  errorDim: 'rgba(255, 75, 75, 0.1)',

  // Borders
  border: '#E5E5E5',
  borderLight: '#F0F0F0',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Fun accent colors
  orange: '#FF9600',
  orangeDark: '#E08600',
  orangeDim: 'rgba(255, 150, 0, 0.12)',
  pink: '#FF86D0',
  pinkDim: 'rgba(255, 134, 208, 0.12)',
  teal: '#2DD4BF',
  tealDim: 'rgba(45, 212, 191, 0.12)',
};

/**
 * Apply branding colors globally — mutates the colors object in-place
 * so every screen that imports `colors` gets the branded values.
 */
export function applyBrandingColors(primary: string, secondary: string): void {
  colors.primary = primary;
  colors.primaryDark = darken(primary);
  colors.primaryDim = dim(primary);
  colors.secondary = secondary;
  colors.secondaryDark = darken(secondary);
  colors.secondaryDim = dim(secondary);
}
