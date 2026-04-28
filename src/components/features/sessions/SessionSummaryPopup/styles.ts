import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, fontFamily, borderRadius, shadows } from '../../../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BODY_WIDTH = SCREEN_WIDTH;
const STAT_CELL_WIDTH = (BODY_WIDTH - spacing.lg * 2 - spacing.sm) / 2;

export const styles = StyleSheet.create({
  /* ═══ Full-Screen Container ═══ */
  overlay: {
    flex: 1,
  },

  /* ═══ Close Button ═══ */
  closeButton: {
    position: 'absolute',
    top: 56,
    right: spacing.md,
    zIndex: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ═══ Gradient Header ═══ */
  header: {
    paddingTop: 72,
    paddingBottom: 48,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  characterContainer: {
    marginBottom: spacing.md,
  },
  sparkleContainer: {
    position: 'absolute',
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  levelBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.pill,
    marginBottom: spacing.sm,
  },
  levelBadgeText: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.white,
  },
  celebrationTitle: {
    fontSize: 32,
    fontFamily: fontFamily.headingHeavy,
    color: colors.white,
    textAlign: 'center',
  },
  sessionName: {
    fontSize: 16,
    fontFamily: fontFamily.bodyMedium,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  /* ═══ Confetti Particle ═══ */
  confettiParticle: {
    position: 'absolute',
    zIndex: 5,
  },

  /* ═══ Body (White rounded) ═══ */
  body: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },

  /* ═══ Section Labels ═══ */
  sectionLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },

  /* ═══ This Session Card ═══ */
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    ...shadows.card,
  },
  sessionStatItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  sessionStatIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionStatValue: {
    fontSize: 15,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  sessionStatLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },

  /* ═══ XP Card (unified container) ═══ */
  xpCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  xpSection: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  xpTotalLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  xpTotalValue: {
    fontSize: 48,
    fontFamily: fontFamily.headingHeavy,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  xpBreakdownRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  xpBreakdownItem: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  xpBreakdownIcon: {
    marginBottom: spacing.xs,
  },
  xpBreakdownValue: {
    fontSize: 20,
    fontFamily: fontFamily.headingBold,
  },
  xpBreakdownLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
    marginTop: 2,
  },

  /* ═══ Stats Grid ═══ */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statsCell: {
    width: STAT_CELL_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  statsCellIconBox: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statsCellValue: {
    fontSize: 22,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  statsCellLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
    marginTop: 2,
  },

  /* ═══ Sticky Button ═══ */
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
