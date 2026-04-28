import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamily } from '../../../theme';

export const BUTTON_COLORS = {
  primary: {
    bg: colors.swimmer,
    border: colors.swimmerDark,
    text: colors.white,
  },
  blue: {
    bg: colors.primary,
    border: colors.primaryDark,
    text: colors.white,
  },
  danger: {
    bg: colors.error,
    border: colors.errorDark,
    text: colors.white,
  },
  secondary: {
    bg: colors.white,
    border: colors.border,
    text: colors.textMuted,
  },
};

export const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderBottomWidth: 4,
    height: 52,
    paddingHorizontal: spacing.lg,
  },
  secondaryBorder: {
    borderWidth: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontFamily: fontFamily.bodySemiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loader: {
    marginRight: spacing.sm,
  },
});
