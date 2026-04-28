import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamily } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
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
