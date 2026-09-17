import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamily, typography } from '../../../../theme';

// Brand colors (selected border, tint, check) are applied inline at render time.
export const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.sm + 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 4,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  cardSelected: {
    borderWidth: 1.5,
    // 0.5 less padding keeps the content from shifting when the border thickens.
    padding: spacing.md - 0.5,
  },
  body: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
    flexShrink: 1,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.warningDim,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.warningDark,
  },
  radio: {
    paddingTop: 2,
  },
});
