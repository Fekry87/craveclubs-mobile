import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamily, typography } from '../../../../theme';

export const styles = StyleSheet.create({
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  bio: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  price: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  listPrice: {
    ...typography.caption,
    color: colors.textDim,
    textDecorationLine: 'line-through',
  },
  savePill: {
    backgroundColor: colors.successDim,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  saveText: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.swimmerDark,
  },
});
