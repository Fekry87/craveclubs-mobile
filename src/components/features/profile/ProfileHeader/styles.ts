import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, borderRadius } from '../../../../theme';

export const AVATAR_SIZE = 88;

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    marginBottom: spacing.md,
  },
  // Outside the clipped circle, so it can overlap the edge (as on Step 1).
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
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
