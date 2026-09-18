import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily, shadows } from '../../../theme';

export const SEGMENT_RADIUS = 12;
export const SEGMENT_PADDING = 3;

export const s = StyleSheet.create({
  segmentWrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: SEGMENT_RADIUS,
    padding: SEGMENT_PADDING,
  },
  segmentIndicator: {
    position: 'absolute',
    top: SEGMENT_PADDING,
    bottom: SEGMENT_PADDING,
    backgroundColor: colors.white,
    borderRadius: SEGMENT_RADIUS - 2,
    ...shadows.md,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: 2,
    alignItems: 'center',
    zIndex: 1,
  },
  segmentText: {
    fontSize: 14,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },
  segmentTextActive: {
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
});
