import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily } from '../../../../theme';

export const styles = StyleSheet.create({
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  liveText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.warning,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  groupText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
});
