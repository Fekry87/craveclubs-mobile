import { TextStyle } from 'react-native';

/**
 * Typography System
 *
 * Heading: Outfit — geometric, calm, medium-weight (Ahead-style)
 *   → Screen titles, section headers, big numbers
 *
 * Body: DM Sans — clean, highly legible at small sizes
 *   → Paragraphs, labels, buttons, captions
 *
 * Key names are stable across redesigns — consumers reference roles,
 * never font names.
 */
export const fontFamily = {
  headingSemiBold: 'Outfit_500Medium',
  headingBold: 'Outfit_600SemiBold',
  headingHeavy: 'Outfit_700Bold',
  bodyRegular: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
  bodyBold: 'DMSans_700Bold',
};

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
