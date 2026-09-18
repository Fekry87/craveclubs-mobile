import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, typography } from '../../../../theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
  event: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  session: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  time: {
    fontSize: 17,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
});
