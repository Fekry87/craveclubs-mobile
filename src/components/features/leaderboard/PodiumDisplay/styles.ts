import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, borderRadius, shadows } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    // No margin — podium lives inside a Card now
  },

  // === Podium Row: 2nd | 1st | 3rd side by side ===
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  // === Shared Podium Slot (2nd & 3rd) ===
  podiumSlot: {
    flex: 1,
    alignItems: 'center',
  },
  slotAvatarRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    position: 'relative',
    marginBottom: spacing.xs,
    ...shadows.sm,
  },
  slotRankCircle: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  slotRankText: {
    fontSize: 11,
    fontFamily: fontFamily.headingBold,
    color: colors.white,
  },
  slotName: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
    textAlign: 'center',
    maxWidth: 100,
    marginBottom: 2,
  },
  slotXpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: spacing.sm,
  },
  slotXp: {
    fontSize: 13,
    fontFamily: fontFamily.headingBold,
  },

  // === Podium Blocks ===
  podiumBlock: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
  },
  podiumBlockGold: {
    height: 64,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 213, 79, 0.5)',
    ...shadows.sm,
  },
  podiumBlockSilver: {
    height: 48,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(224, 224, 224, 0.6)',
    ...shadows.sm,
  },
  podiumBlockBronze: {
    height: 36,
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 204, 128, 0.5)',
    ...shadows.sm,
  },

  // === Champion Slot (#1 — center, elevated) ===
  championSlot: {
    flex: 1.2,
    alignItems: 'center',
    position: 'relative',
  },
  crownFloat: {
    marginBottom: -4,
    zIndex: 2,
  },
  championRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sparkleL: {
    position: 'absolute',
    top: 28,
    left: 4,
  },
  sparkleR: {
    position: 'absolute',
    top: 20,
    right: 4,
  },
  championName: {
    fontSize: 15,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    textAlign: 'center',
    maxWidth: 110,
    marginBottom: 2,
  },
  championXpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: spacing.sm,
  },
  championXp: {
    fontSize: 18,
    fontFamily: fontFamily.headingHeavy,
    color: '#E6A800',
  },
  championXpSuffix: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  goldLevelBadge: {
    backgroundColor: '#FFC800',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  goldLevelText: {
    fontSize: 10,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.white,
  },
});
