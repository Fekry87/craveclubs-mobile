import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamily } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },

  // Header: title + status badge
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  statusText: {
    fontSize: 10,
    fontFamily: fontFamily.bodySemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Meta row: date + time
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textDim,
  },
  timeText: {
    fontSize: 12,
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
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },

  // Motivation banner
  motivationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    backgroundColor: colors.swimmerDim,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  motivationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  xpIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.swimmer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpValue: {
    fontSize: 14,
    fontFamily: fontFamily.headingBold,
    color: colors.swimmer,
  },
  xpLabel: {
    fontSize: 10,
    fontFamily: fontFamily.bodyRegular,
    color: colors.swimmerDark,
  },
  motivationRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  motivationText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.orange,
  },

  // Earned banner (completed + attended)
  earnedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    backgroundColor: colors.swimmerDim,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  earnedIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.swimmer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnedValue: {
    fontSize: 14,
    fontFamily: fontFamily.headingBold,
    color: colors.swimmer,
  },
  earnedLabel: {
    fontSize: 10,
    fontFamily: fontFamily.bodyRegular,
    color: colors.swimmerDark,
  },
  earnedText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.swimmer,
  },

  // Missed banner (completed + absent)
  missedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    backgroundColor: colors.errorDim,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  missedIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missedValue: {
    fontSize: 14,
    fontFamily: fontFamily.headingBold,
    color: colors.error,
  },
  missedLabel: {
    fontSize: 10,
    fontFamily: fontFamily.bodyRegular,
    color: colors.errorDark,
  },
  missedText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.orange,
  },
});
