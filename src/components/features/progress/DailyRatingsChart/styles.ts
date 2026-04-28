import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, borderRadius } from '../../../../theme';

const BAR_AREA_HEIGHT = 100;

export const styles = StyleSheet.create({
  /* ── Title row ── */
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  monthLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },

  /* ── Week navigator ── */
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  weekNavBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekNavBtnDisabled: {
    opacity: 0.35,
  },
  weekLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },

  /* ── Day labels row (TOP) ── */
  dayLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xs,
  },
  dayLabelCol: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabelText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textDim,
  },
  dayLabelToday: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemiBold,
  },
  dayLabelDimmed: {
    opacity: 0.25,
  },
  dayNum: {
    fontSize: 10,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textDim,
    marginTop: 1,
  },
  dayNumToday: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemiBold,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },

  /* ── Chart area ── */
  chartWrap: {
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  weekPage: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: BAR_AREA_HEIGHT,
  },

  /* ── Day bar column ── */
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barArea: {
    height: BAR_AREA_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barScore: {
    fontSize: 10,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
    marginBottom: 3,
  },
  barWrapper: {
    width: 26,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  barGradient: {
    flex: 1,
    borderRadius: borderRadius.sm,
  },
  barDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceLight,
    marginBottom: 2,
  },

  /* ── Empty state ── */
  emptyText: {
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
