import { StyleSheet } from 'react-native';
import { colors, fontFamily } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },
});
