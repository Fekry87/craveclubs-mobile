import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, borderRadius, shadows } from '../../../../theme';

export const styles = StyleSheet.create({
  segmentBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    ...shadows.sm,
  },

  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
  },
  segmentTabActive: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },

  segmentLabel: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  segmentLabelActive: {
    color: colors.white,
  },

  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.border,
    paddingHorizontal: 6,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },

  countText: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  countTextActive: {
    color: colors.white,
  },
});
