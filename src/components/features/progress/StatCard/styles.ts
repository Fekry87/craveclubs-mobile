import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, borderRadius } from '../../../../theme';

export const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: 24,
    fontFamily: fontFamily.headingBold,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
