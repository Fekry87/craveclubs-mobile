import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamily } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },

  // Header: title + status badge
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  statusText: {
    fontSize: 10,
    fontFamily: fontFamily.bodySemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Meta row: date + time
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textDim,
  },
  timeText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },

  // Info chips
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },
});
