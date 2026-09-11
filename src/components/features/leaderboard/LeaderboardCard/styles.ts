import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, borderRadius } from '../../../../theme';

export const styles = StyleSheet.create({
  cardSpacing: {
    marginBottom: spacing.sm,
  },
  currentUserCard: {
    // brand tint + border applied inline at render time (branding-aware)
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankColumn: {
    width: 28,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  rankText: {
    fontSize: 15,
    fontFamily: fontFamily.headingSemiBold,
    color: colors.textMuted,
  },
  rankTextTop: {
    color: colors.text,
    fontSize: 17,
    fontFamily: fontFamily.headingBold,
  },
  avatarColumn: {
    marginRight: spacing.sm,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
    flexShrink: 1,
  },
  youBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  youBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bodySemiBold,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  levelName: {
    fontSize: 12,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  xp: {
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  xpLabel: {
    fontSize: 10,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },
});
