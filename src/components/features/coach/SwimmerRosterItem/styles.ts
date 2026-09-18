import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamily } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameSection: {
    flex: 1,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flexShrink: 1,
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  noteBox: {
    marginTop: spacing.sm,
  },
  noteInput: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm + 4,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
  },
  noteHint: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primaryDim,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  levelText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyMedium,
    color: colors.primary,
  },
  measureBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  measureCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  measureCountText: {
    fontSize: 10,
    lineHeight: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
  toggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  ratingSection: {
    alignItems: 'flex-end',
  },
});
