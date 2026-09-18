import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, borderRadius, typography, shadows } from '../../../../theme';

/** Chart geometry, shared with the plotting math in index.tsx. */
export const CHART_HEIGHT = 210;
/** Top of the plot (room above the highest dot for its value label). */
export const PLOT_TOP = 26;
/** Bottom of the plot (room below for the date labels). */
export const PLOT_BOTTOM = 168;
/** Headroom so the fastest/slowest dots don't glue to the plot edges. */
export const V_MARGIN = 12;
/** Horizontal padding before the first / after the last point. */
export const PAD_X = 30;
/** Minimum gap between points; a tighter fit than this scrolls. */
export const STEP_MIN = 74;

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: 6,
    paddingRight: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  trendText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.sm + 2,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },

  /* ─── Day / Week / Month toggle ─── */
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: 3,
    marginBottom: spacing.sm + 2,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md - 3,
  },
  toggleBtnActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  toggleText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },
  toggleTextActive: {
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },

  /* ─── Stroke chips ─── */
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },

  /* ─── Chart ─── */
  chartArea: {
    marginTop: spacing.md,
    height: CHART_HEIGHT,
  },
  chartLoading: {
    opacity: 0.4,
  },
  avgLabel: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  avgText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },

  footerText: {
    ...typography.caption,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
