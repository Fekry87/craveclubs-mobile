import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamily } from '../../../../theme';

const banner = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
  marginTop: spacing.md,
  borderRadius: borderRadius.sm,
  paddingVertical: spacing.sm + 2,
  paddingHorizontal: spacing.md,
};

const iconCircle = {
  width: 30,
  height: 30,
  borderRadius: 15,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};

export const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm + 4,
  },

  // Header: title + status pill
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
  },

  // Meta row: date + time
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs + 2,
  },
  dateText: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textDim,
  },
  timeText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },

  // Info chips
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
  },
  infoText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },

  // Upcoming banner — neutral surface, brand accent
  motivationBanner: {
    ...banner,
    backgroundColor: colors.surfaceLight,
  },
  motivationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  xpIconCircle: {
    ...iconCircle,
    backgroundColor: colors.primaryDim,
  },
  xpValue: {
    fontSize: 15,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  xpLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },
  motivationRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  motivationText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },

  // Earned banner (completed + attended)
  earnedBanner: {
    ...banner,
    backgroundColor: colors.swimmerDim,
  },
  earnedIconCircle: {
    ...iconCircle,
    backgroundColor: colors.white,
  },
  earnedValue: {
    fontSize: 15,
    fontFamily: fontFamily.headingBold,
    color: colors.swimmerDark,
  },
  earnedLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bodyRegular,
    color: colors.swimmerDark,
  },
  earnedText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyMedium,
    color: colors.swimmerDark,
  },

  // Missed banner (completed + absent)
  missedBanner: {
    ...banner,
    backgroundColor: colors.errorDim,
  },
  missedIconCircle: {
    ...iconCircle,
    backgroundColor: colors.white,
  },
  missedValue: {
    fontSize: 15,
    fontFamily: fontFamily.headingBold,
    color: colors.error,
  },
  missedLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bodyRegular,
    color: colors.errorDark,
  },
  missedText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },

  // Cancelled banner — the reason takes the place of the XP
  cancelledBanner: {
    ...banner,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: spacing.sm + 2,
    backgroundColor: colors.errorDim,
  },
  cancelledIconCircle: {
    ...iconCircle,
    backgroundColor: colors.white,
  },
  cancelledBody: {
    flex: 1,
  },
  cancelledValue: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.headingBold,
    color: colors.error,
  },
  cancelledReason: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
  },
});
