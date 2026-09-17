import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography, fontFamily } from '../../../../theme';

export const styles = StyleSheet.create({
  // ── Height & weight ─────────────────────────────────────────
  measureCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm + 4,
  },
  measureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  measureLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.bodyMedium,
    color: colors.text,
  },
  measureValue: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  measureUnit: {
    fontSize: 14,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    ...typography.caption,
    color: colors.textDim,
  },

  // ── Sections ────────────────────────────────────────────────
  section: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  // ── Medical notes ───────────────────────────────────────────
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + 4,
    paddingBottom: spacing.sm + 4,
    minHeight: 104,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
  },
  charCounter: {
    ...typography.caption,
    color: colors.textDim,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});
