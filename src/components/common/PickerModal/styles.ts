import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, fontFamily, borderRadius, shadows } from '../../../theme';

export const styles = StyleSheet.create({
  /* ── Overlay ── */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },

  /* ── Bottom Sheet ── */
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.modal,
    borderTopRightRadius: borderRadius.modal,
    overflow: 'hidden',
    ...shadows.lg,
  },

  /* ── Accent stripe at top ── */
  accentStripe: {
    height: 3,
    width: '100%',
  },

  /* ── Drag handle ── */
  handleRow: {
    alignItems: 'center',
    paddingTop: spacing.sm + 2,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.md,
  },

  /* ── Header Buttons ── */
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.sm,
  },
  cancelBtn: {
    backgroundColor: colors.surfaceLight,
  },
  cancelText: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  doneText: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    // color set dynamically
  },

  /* ── Title ── */
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  titleIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },

  /* ── Divider ── */
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },

  /* ── Content — full width, centered ── */
  content: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },

  /* ── Picker — stretch full width so wheels center naturally ── */
  picker: {
    width: '100%',
    height: 220,
  },

  /* ── Safe bottom ── */
  bottomSafe: {
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
  },
});
