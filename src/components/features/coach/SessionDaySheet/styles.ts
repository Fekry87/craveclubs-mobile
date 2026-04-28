import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, shadows, typography, fontFamily } from '../../../../theme';

export const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.modal,
    borderTopRightRadius: borderRadius.modal,
    maxHeight: '70%',
    ...shadows.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: spacing.sm + 2,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerDate: {
    fontSize: 17,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  headerCount: {
    fontSize: 12,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    marginTop: 2,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },

  /* Session card */
  sessionCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sessionGroup: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  statusText: {
    fontSize: 10,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Detail rows */
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },

  /* Attendance bar */
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.xs,
  },
  attendanceBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  attendanceFill: {
    height: 6,
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  attendanceText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
    minWidth: 36,
    textAlign: 'right',
  },

  /* Action buttons */
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm + 2,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
  },
  actionBtnSecondary: {
    backgroundColor: colors.surfaceLight,
  },
  actionBtnDisabled: {
    backgroundColor: colors.surfaceLight,
    opacity: 0.5,
  },
  actionTextPrimary: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.white,
  },
  actionTextSecondary: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
});
