import { StyleSheet } from 'react-native';
import { spacing, borderRadius } from '../../../../theme';

export const styles = StyleSheet.create({
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: spacing.lg,
  },
});
