import { StyleSheet } from 'react-native';
import { borderRadius, shadows, colors, spacing } from '../../../theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    // NO overflow: 'hidden' — it clips the soft shadow on iOS
    ...shadows.card,
  },
  cardInner: {
    padding: spacing.md,
    borderRadius: borderRadius.card - 1,
    overflow: 'hidden',
  },
});
