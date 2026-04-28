import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
