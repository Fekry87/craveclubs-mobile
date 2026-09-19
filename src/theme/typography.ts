import { TextStyle, I18nManager } from 'react-native';

/**
 * Typography System
 *
 * Latin (LTR): Outfit for headings, DM Sans for body — geometric, calm.
 * Arabic (RTL): IBM Plex Sans Arabic across the board — Outfit/DM Sans carry no
 * Arabic glyphs.
 *
 * The map is chosen at module load from `I18nManager.isRTL`, which persists
 * natively across restarts. A language switch flips that flag and reloads, so
 * `StyleSheet.create` captures the right family on the next launch. Key names
 * are stable — consumers reference roles, never font names.
 */
const latinFonts = {
  headingSemiBold: 'Outfit_500Medium',
  headingBold: 'Outfit_600SemiBold',
  headingHeavy: 'Outfit_700Bold',
  bodyRegular: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
  bodyBold: 'DMSans_700Bold',
};

const arabicFonts = {
  headingSemiBold: 'IBMPlexSansArabic_500Medium',
  headingBold: 'IBMPlexSansArabic_600SemiBold',
  headingHeavy: 'IBMPlexSansArabic_700Bold',
  bodyRegular: 'IBMPlexSansArabic_400Regular',
  bodyMedium: 'IBMPlexSansArabic_500Medium',
  bodySemiBold: 'IBMPlexSansArabic_600SemiBold',
  bodyBold: 'IBMPlexSansArabic_700Bold',
};

export const fontFamily = I18nManager.isRTL ? arabicFonts : latinFonts;

export const typography: Record<string, TextStyle> = {
  /** One statement headline per screen at most (the club-name entry screen). */
  display: { fontSize: 40, lineHeight: 44, fontFamily: fontFamily.headingBold },
  hero: { fontSize: 32, lineHeight: 38, fontFamily: fontFamily.headingBold },
  heading: { fontSize: 26, lineHeight: 32, fontFamily: fontFamily.headingBold },
  subheading: { fontSize: 20, lineHeight: 26, fontFamily: fontFamily.headingSemiBold },
  body: { fontSize: 15, lineHeight: 22, fontFamily: fontFamily.bodyRegular },
  bodyMedium: { fontSize: 15, lineHeight: 22, fontFamily: fontFamily.bodyMedium },
  caption: { fontSize: 13, lineHeight: 18, fontFamily: fontFamily.bodyRegular },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.bodyMedium,
    letterSpacing: 0.3,
  },
};
