import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, borderRadius } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: 22,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
