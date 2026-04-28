import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography, fontFamily } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm + 4,
  },
  numberText: {
    ...typography.caption,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  notes: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  badgeText: {
    ...typography.caption,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 28 + spacing.sm + 4,
  },
});
