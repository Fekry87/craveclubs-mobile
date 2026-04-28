import { StyleSheet } from 'react-native';
import { colors, typography } from '../../../theme';

export const styles = StyleSheet.create({
  hero: {
    ...typography.hero,
    color: colors.text,
  },
  heading: {
    ...typography.heading,
    color: colors.text,
  },
  subheading: {
    ...typography.subheading,
    color: colors.text,
  },
  body: {
    ...typography.body,
    color: colors.text,
  },
  bodyMedium: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  caption: {
    ...typography.caption,
    color: colors.textMuted,
  },
  label: {
    ...typography.label,
    color: colors.textDim,
    textTransform: 'uppercase',
  },
});
