import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamily, typography } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  iconTile: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.card,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  action: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
});
