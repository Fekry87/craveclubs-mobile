import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamily } from '../../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'blue';

interface ButtonColorSet {
  bg: string;
  text: string;
  border?: string;
}

/**
 * Resolved at render time so branded colors (mutated in-place by
 * applyBrandingColors) are picked up.
 *  primary   — solid brand fill, white text
 *  secondary — soft brand tint, brand text
 *  ghost     — white, hairline border, dark text
 *  danger    — solid error fill
 *  blue      — legacy alias of primary
 */
export const getButtonColors = (variant: ButtonVariant): ButtonColorSet => {
  switch (variant) {
    case 'secondary':
      return { bg: colors.primaryDim, text: colors.primary };
    case 'ghost':
      return { bg: colors.white, text: colors.text, border: colors.border };
    case 'danger':
      return { bg: colors.error, text: colors.white };
    case 'blue':
    case 'primary':
    default:
      return { bg: colors.primary, text: colors.white };
  }
};

export const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
  },
  bordered: {
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontSize: 16,
    fontFamily: fontFamily.bodySemiBold,
  },
  loader: {
    marginRight: spacing.sm,
  },
});
