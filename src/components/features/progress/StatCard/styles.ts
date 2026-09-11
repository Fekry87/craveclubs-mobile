import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily } from '../../../../theme';

export const styles = StyleSheet.create({
  content: {
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm + 4,
  },
  value: {
    fontSize: 22,
    lineHeight: 26,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
    marginTop: 2,
  },
});
