import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  track: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceLight,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
});
