import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography, fontFamily } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 4,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.warningDim,
    marginBottom: spacing.md,
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  message: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
