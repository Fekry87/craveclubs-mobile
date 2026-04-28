import { TextStyle } from 'react-native';

/**
 * Typography System
 *
 * Heading: Fredoka — rounded, bold, playful (Feather Bold style)
 *   → Use for large, brief headlines, section titles, and bold callouts
 *
 * Body: Nunito — clean rounded sans-serif (Din Next Rounded style)
 *   → Use for longer text, paragraphs, labels, and descriptions
 */
export const fontFamily = {
  headingSemiBold: 'Fredoka_600SemiBold',
  headingBold: 'Fredoka_700Bold',
  headingHeavy: 'Fredoka_700Bold',
  bodyRegular: 'Nunito_400Regular',
  bodyMedium: 'Nunito_500Medium',
  bodySemiBold: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
};

export const typography: Record<string, TextStyle> = {
  hero: { fontSize: 32, fontFamily: fontFamily.headingBold },
  heading: { fontSize: 24, fontFamily: fontFamily.headingBold },
  subheading: { fontSize: 18, fontFamily: fontFamily.headingSemiBold },
  body: { fontSize: 14, fontFamily: fontFamily.bodyRegular },
  bodyMedium: { fontSize: 14, fontFamily: fontFamily.bodyMedium },
  caption: { fontSize: 12, fontFamily: fontFamily.bodyRegular },
  label: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    letterSpacing: 0.5,
  },
};
