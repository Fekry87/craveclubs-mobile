import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamily } from '../../../theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textDim,
    marginTop: 2,
  },
});
