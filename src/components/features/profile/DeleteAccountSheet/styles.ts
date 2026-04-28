import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, fontFamily, borderRadius, shadows } from '../../../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SHEET_HEIGHT = 420;

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.modal,
    borderTopRightRadius: borderRadius.modal,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    minHeight: SHEET_HEIGHT,
    ...shadows.lg,
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.errorDim,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  bold: {
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  errorBanner: {
    backgroundColor: colors.errorDim,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyMedium,
    color: colors.error,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  buttonHalf: {
    flex: 1,
  },
  keepButton: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: colors.border,
  },
  keepButtonText: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  deleteButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: colors.errorDark,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.white,
  },
});
