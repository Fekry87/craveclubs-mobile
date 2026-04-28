import { StyleSheet, Dimensions } from 'react-native';
import { colors, typography, fontFamily } from '../../../../theme';

const CELL_SIZE = Math.floor((Dimensions.get('window').width - 32) / 7);

export const CALENDAR_CELL_SIZE = CELL_SIZE;

export const styles = StyleSheet.create({
  container: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: CELL_SIZE / 2,
  },
  padding: {
    backgroundColor: 'transparent',
  },
  noSessions: {
    backgroundColor: 'transparent',
  },
  hasSessions: {
    backgroundColor: colors.surfaceLight,
  },
  todayNoSess: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  todaySess: {
    backgroundColor: colors.primaryDim,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    ...typography.caption,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
    marginBottom: 2,
  },
  dayTextBold: {
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  dayTextToday: {
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },
  dayTextSelected: {
    color: colors.white,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    height: 6,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotScheduled: {
    backgroundColor: colors.primary,
  },
  dotCompleted: {
    backgroundColor: colors.success,
  },
  dotCancelled: {
    backgroundColor: colors.error,
  },
  dotLive: {
    backgroundColor: colors.orange,
  },
  dotSelectedWhite: {
    backgroundColor: colors.white,
  },
  microText: {
    ...typography.caption,
    fontSize: 8,
    color: colors.textDim,
  },
  microTextSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
});
