import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, borderRadius } from '../../../../theme';

export const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 130,
    paddingTop: spacing.sm,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    width: 32,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  barGradient: {
    flex: 1,
    borderRadius: borderRadius.sm,
  },
  barValue: {
    fontSize: 10,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  barLabel: {
    fontSize: 10,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textDim,
    marginTop: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
