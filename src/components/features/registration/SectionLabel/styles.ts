import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, typography } from '../../../../theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.bodyMedium,
    color: colors.text,
    flexShrink: 1,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  error: {
    fontSize: 13,
    fontFamily: fontFamily.bodyRegular,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
