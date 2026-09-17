import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamily, typography } from '../../../../theme';

export const styles = StyleSheet.create({
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  bio: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  price: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  listPrice: {
    ...typography.caption,
    color: colors.textDim,
    textDecorationLine: 'line-through',
  },
  savePill: {
    backgroundColor: colors.successDim,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  saveText: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.swimmerDark,
  },
  // ── Group card ──
  pillRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  pill: {
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  pillText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.bodySemiBold,
  },
  dayRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginTop: spacing.sm + 4,
  },
  dayChip: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  dayChipText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.bodySemiBold,
  },
  dayChipOff: {
    color: colors.textDim,
    fontFamily: fontFamily.bodyMedium,
  },
  timeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm + 4,
  },
  timeLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: fontFamily.bodyMedium,
    letterSpacing: 0.3,
    color: colors.textDim,
  },
  timeValue: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  timeDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  timeDuration: {
    marginLeft: 'auto',
    ...typography.caption,
    color: colors.textMuted,
  },
});
