import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { CoachSessionInterface } from '../../../../types/models.types';
import { styles } from './styles';

interface CalendarDayCellProps {
  date: number | null; // null = padding day
  sessions: CoachSessionInterface[];
  isToday: boolean;
  isSelected: boolean;
  onPress: () => void;
}

const STATUS_DOT_MAP: Record<string, ViewStyle> = {
  Scheduled: styles.dotScheduled,
  Live: styles.dotLive,
  Completed: styles.dotCompleted,
  Cancelled: styles.dotCancelled,
};

export const CalendarDayCell: React.FC<CalendarDayCellProps> = React.memo(
  ({ date, sessions, isToday, isSelected, onPress }) => {
    if (date === null) {
      return <View style={[styles.container, styles.padding]} />;
    }

    const hasSessions = sessions.length > 0;

    // Determine container style
    const containerStyles = [
      styles.container,
      !hasSessions && !isToday && !isSelected && styles.noSessions,
      hasSessions && !isToday && !isSelected && styles.hasSessions,
      isToday && !hasSessions && !isSelected && styles.todayNoSess,
      isToday && hasSessions && !isSelected && styles.todaySess,
      isSelected && styles.selected,
    ];

    // Determine text style
    const textStyles = [
      styles.dayText,
      hasSessions && styles.dayTextBold,
      isToday && !isSelected && styles.dayTextToday,
      isSelected && styles.dayTextSelected,
    ];

    // Compute unique status dots (max 3)
    const uniqueStatuses = [
      ...new Set(sessions.map((s) => s.status)),
    ].slice(0, 3);
    const extraCount = sessions.length - 3;

    return (
      <TouchableOpacity
        style={containerStyles}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={textStyles}>{date}</Text>
        {hasSessions && (
          <View style={styles.dotsRow}>
            {uniqueStatuses.map((status) => (
              <View
                key={status}
                style={[
                  styles.dot,
                  isSelected
                    ? styles.dotSelectedWhite
                    : STATUS_DOT_MAP[status] ?? styles.dotScheduled,
                ]}
              />
            ))}
            {extraCount > 0 && (
              <Text
                style={[
                  styles.microText,
                  isSelected && styles.microTextSelected,
                ]}
              >
                +{extraCount}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  },
);
