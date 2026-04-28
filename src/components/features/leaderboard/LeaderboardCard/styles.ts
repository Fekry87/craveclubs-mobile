import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, borderRadius, shadows } from '../../../../theme';

export const styles = StyleSheet.create({
  cardSpacing: {
    marginBottom: spacing.sm,
  },
  currentUserCard: {
    backgroundColor: colors.primaryDim,
    borderColor: 'rgba(28, 176, 246, 0.2)',
    ...shadows.card,
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
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.textMuted,
  },
  rankTextTop: {
    color: colors.text,
    fontSize: 18,
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
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  youBadgeText: {
    fontSize: 9,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    color: colors.primary,
  },
  xpLabel: {
    fontSize: 10,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },
});
