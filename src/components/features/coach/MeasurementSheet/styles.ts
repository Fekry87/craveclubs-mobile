import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, typography, borderRadius } from '../../../../theme';

export const styles = StyleSheet.create({
  intro: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  introName: {
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  gap: {
    height: spacing.md,
  },
  status: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  statusTitle: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  statusText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },

  /* ─── Time ─── */
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  timeField: {
    flex: 1,
    alignItems: 'center',
  },
  timeInput: {
    alignSelf: 'stretch',
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  timeInputRunning: {
    backgroundColor: colors.surfaceLight,
  },
  timeUnit: {
    ...typography.label,
    color: colors.textDim,
    marginTop: 4,
  },
  timeSeparator: {
    fontSize: 24,
    lineHeight: 56,
    fontFamily: fontFamily.headingBold,
    color: colors.textDim,
  },
  stopwatch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  stopwatchText: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
  },

  /* ─── Already recorded ─── */
  recorded: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  recordedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  recordedText: {
    flex: 1,
  },
  recordedEvent: {
    ...typography.body,
    color: colors.text,
  },
  recordedTime: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  recordedSpacer: {
    width: 18,
  },
});
