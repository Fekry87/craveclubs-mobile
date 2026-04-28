import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, shadows, typography, fontFamily } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.sm + 4,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  chevron: {
    marginRight: spacing.sm,
  },
  phaseCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm + 2,
  },
  phaseNumber: {
    ...typography.caption,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.white,
  },
  headerContent: {
    flex: 1,
  },
  phaseName: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  weekRange: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  countBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  countText: {
    ...typography.caption,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  expandedContent: {
    overflow: 'hidden',
  },
  focusPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  focusText: {
    ...typography.caption,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },
  exerciseList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm + 4,
  },
});
