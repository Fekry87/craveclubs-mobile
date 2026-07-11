type GradientPair = [string, string];

/**
 * Gradient pairs used across the app.
 * splash / avatar / bar are brand-dependent and re-derived by
 * applyBrandingToGradients() when club branding loads.
 * streak / medal gradients are intentionally neutral.
 */
export const gradients: {
  splash: GradientPair;
  avatar: GradientPair;
  bar: GradientPair;
  streak: GradientPair;
  gold: GradientPair;
  silver: GradientPair;
  bronze: GradientPair;
} = {
  splash: ['#1CB0F6', '#58CC02'],
  avatar: ['#1CB0F6', '#CE82FF'],
  bar: ['#1CB0F6', '#58CC02'],
  streak: ['#FF9600', '#FFC800'],
  gold: ['#FFC800', '#FF9600'],
  silver: ['#C0C0C0', '#E0E0E0'],
  bronze: ['#CD7F32', '#DDA15E'],
};

/** Re-derive brand-dependent gradients after branding colors change */
export function applyBrandingToGradients(
  primary: string,
  swimmer: string,
  secondary: string,
): void {
  gradients.splash = [primary, swimmer];
  gradients.avatar = [primary, secondary];
  gradients.bar = [primary, swimmer];
}
