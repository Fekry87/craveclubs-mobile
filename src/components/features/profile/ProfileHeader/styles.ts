import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, shadows } from '../../../../theme';

export const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrapper: {
    ...shadows.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontFamily: fontFamily.headingBold,
    color: colors.white,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  name: {
    fontSize: 18,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
  },
  levelText: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.white,
  },
  email: {
    fontSize: 13,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },
});
