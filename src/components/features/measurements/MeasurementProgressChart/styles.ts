import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, borderRadius, typography, shadows } from '../../../../theme';

/** Bar geometry, shared with the height math in index.tsx. */
export const BAR_MAX = 120;
export const BAR_MIN = 22;
/** Space under the bars for the week label. */
export const WEEK_LABEL_SPACE = 24;
/** Bar-column geometry, shared with the fits-or-scrolls math in index.tsx. */
export const COLUMN_WIDTH = 56;
export const COLUMN_GAP = 16;

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
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: COLUMN_GAP,
  },
  // Everything fits: spread the weeks across the card, no scrolling.
  barsRowSpread: {
    flexGrow: 1,
    justifyContent: 'space-evenly',
    gap: 0,
  },
  column: {
    alignItems: 'center',
    width: COLUMN_WIDTH,
  },
  barValue: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  bar: {
    width: 30,
    borderRadius: 8,
  },
  weekLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textDim,
    marginTop: 6,
    height: WEEK_LABEL_SPACE - 6,
  },

  /* ─── Average line ─── */
  averageLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  averageDash: {
    flex: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textDim,
  },
  averageText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
    // Legible over whichever bar it lands on.
    backgroundColor: colors.white,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },

  footerText: {
    ...typography.caption,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
