import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, borderRadius } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 30,
    fontFamily: fontFamily.headingBold,
    color: colors.white,
  },
  name: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  levelBadge: {
    marginTop: spacing.sm + 2,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
  },
  levelText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
  },
});
