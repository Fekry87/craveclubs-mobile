import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, borderRadius } from '../../../../theme';

export const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.surfaceLight,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningDim,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  typePillText: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.warningDark,
  },
  xp: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.headingBold,
  },
});
