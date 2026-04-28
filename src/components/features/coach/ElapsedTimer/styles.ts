import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timerText: {
    fontSize: 28,
    fontFamily: fontFamily.headingBold,
    color: colors.warning,
  },
  label: {
    fontSize: 12,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },
});
