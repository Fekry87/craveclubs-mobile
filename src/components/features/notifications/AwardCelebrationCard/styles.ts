import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, borderRadius, shadows } from '../../../../theme';

const AVATAR_SIZE = 104;
const TROPHY_SIZE = 64;

export const AVATAR = AVATAR_SIZE;

// Brand colors (XP value, the winner ring, the button) are applied inline at
// render time so a club's accent reaches the card without a reload.
export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 27, 47, 0.62)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },

  /* ═══ Confetti (WelcomeConfetti technique, one burst per award) ═══ */
  confettiLayer: {
    ...StyleSheet.absoluteFill,
  },
  confettiDot: {
    position: 'absolute',
    top: 0,
  },

  /* ═══ Card ═══ */
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: borderRadius.modal,
    paddingTop: TROPHY_SIZE / 2 + spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    ...shadows.lg,
  },
  trophyBadge: {
    position: 'absolute',
    top: -TROPHY_SIZE / 2,
    width: TROPHY_SIZE,
    height: TROPHY_SIZE,
    borderRadius: TROPHY_SIZE / 2,
    backgroundColor: colors.warning,
    borderWidth: 4,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  queueHint: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textDim,
    marginBottom: spacing.sm,
  },

  /* Winner */
  avatarRing: {
    width: AVATAR_SIZE + 12,
    height: AVATAR_SIZE + 12,
    borderRadius: (AVATAR_SIZE + 12) / 2,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceLight,
    overflow: 'hidden',
  },
  awardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    backgroundColor: colors.warningDim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.pill,
    marginBottom: spacing.sm + 4,
  },
  awardPillText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.warningDark,
  },
  headline: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    textAlign: 'center',
  },
  subline: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  /* XP */
  xpRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginTop: spacing.md + 4,
    marginBottom: spacing.lg,
  },
  xpValue: {
    fontSize: 40,
    lineHeight: 44,
    fontFamily: fontFamily.headingHeavy,
  },
  xpSuffix: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },

  /* Button */
  buttonWrap: {
    width: '100%',
  },
});
