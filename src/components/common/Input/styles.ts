import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamily, shadows } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    height: 52,
    ...shadows.sm,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    ...shadows.card,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  errorText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyRegular,
    color: colors.error,
    marginTop: spacing.xs,
  },
  eyeButton: {
    padding: spacing.xs,
  },
});
