import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, typography } from '../../../../theme';

export const styles = StyleSheet.create({
  intro: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  introName: {
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.warningDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
