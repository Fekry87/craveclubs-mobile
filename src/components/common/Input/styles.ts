import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamily } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 60,
  },
  // brand border color applied inline at render time (branding-aware)
  fieldFocused: {
    borderWidth: 1.5,
  },
  fieldError: {
    borderColor: colors.error,
  },
  fieldDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  fieldBody: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
    marginBottom: 2,
  },
  input: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
    padding: 0,
    margin: 0,
  },
  trailing: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trailingText: {
    fontSize: 14,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyRegular,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
