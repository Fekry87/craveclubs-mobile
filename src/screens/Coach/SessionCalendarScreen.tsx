import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Icon } from '../../components/common/Icon';
import { Loader } from '../../components/common/Loader';
import { ErrorView } from '../../components/common/ErrorView';
import { CalendarDayCell } from '../../components/features/coach/CalendarDayCell';
import { SessionDaySheet } from '../../components/features/coach/SessionDaySheet';
import { CoachSessionInterface } from '../../types/models.types';
import { CoachTabParamList } from '../../types/navigation.types';
import { coachService } from '../../api/services/coach.service';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  fontFamily,
  ANIMATION,
} from '../../theme';
import { Animated } from 'react-native';

type CalendarNav = BottomTabNavigationProp<CoachTabParamList>;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Cache for already-fetched months
const sessionCache: Record<string, CoachSessionInterface[]> = {};

export const SessionCalendarScreen: React.FC = () => {
  const navigation = useNavigation<CalendarNav>();

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1-based
  const [sessions, setSessions] = useState<CoachSessionInterface[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDaySheet, setShowDaySheet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headerEntry = useAnimatedEntry(0);
  const calendarEntry = useAnimatedEntry(1);
  const summaryEntry = useAnimatedEntry(2);

  const cacheKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  const fetchMonth = useCallback(
    async (year: number, month: number) => {
      const key = `${year}-${String(month).padStart(2, '0')}`;
      if (sessionCache[key]) {
        setSessions(sessionCache[key]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await coachService.getSessionsByMonth(year, month);
        sessionCache[key] = response.data;
        setSessions(response.data);
        setLoading(false);

        // Prefetch next month in background
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        const nextKey = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
        if (!sessionCache[nextKey]) {
          coachService
            .getSessionsByMonth(nextYear, nextMonth)
            .then((resp) => {
              sessionCache[nextKey] = resp.data;
            })
            .catch(() => {});
        }
      } catch {
        setLoading(false);
        setError('Failed to load sessions.');
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      fetchMonth(currentYear, currentMonth);
      // eslint-disable-next-line -- fetchMonth is stable, only re-run on month change
    }, [currentYear, currentMonth]),
  );

  // Build byDate map
  const byDate = useMemo(() => {
    const map: Record<string, CoachSessionInterface[]> = {};
    for (const s of sessions) {
      const dateKey = s.date.substring(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(s);
    }
    return map;
  }, [sessions]);

  // Calendar grid data
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0=Sun

  const calendarDays: (number | null)[] = [];
  // Padding days
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isViewingCurrentMonth =
    currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1;

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
    setShowDaySheet(false);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
    setShowDaySheet(false);
  };

  const handleDayPress = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    if (byDate[dateStr] && byDate[dateStr].length > 0) {
      setShowDaySheet(true);
    } else {
      setShowDaySheet(false);
    }
  };

  const handleTodayPress = () => {
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    const tStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setSelectedDate(tStr);
    if (byDate[tStr] && byDate[tStr].length > 0) {
      setShowDaySheet(true);
    }
  };

  const handleRecordAttendance = (sessionId: number) => {
    setShowDaySheet(false);
    navigation.navigate('CoachSessions', {
      screen: 'CoachSessionAttendance',
      params: { sessionId },
    });
  };

  const handleViewAttendance = (sessionId: number) => {
    setShowDaySheet(false);
    navigation.navigate('CoachSessions', {
      screen: 'CoachSessionAttendance',
      params: { sessionId },
    });
  };

  // Summary stats
  const totalSessions = sessions.length;
  const completedCount = sessions.filter(
    (s) => s.status === 'Completed',
  ).length;
  const cancelledCount = sessions.filter(
    (s) => s.status === 'Cancelled',
  ).length;

  if (loading && sessions.length === 0) {
    return <Loader message="Loading calendar..." />;
  }
  if (error && sessions.length === 0) {
    return (
      <ErrorView
        message={error}
        onRetry={() => fetchMonth(currentYear, currentMonth)}
      />
    );
  }

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <View style={s.container}>
        {/* Month Header */}
        <Animated.View style={[s.header, headerEntry]}>
          <TouchableOpacity
            onPress={handlePrevMonth}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left-s-line" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={s.monthTitle}>
            {MONTH_NAMES[currentMonth - 1]} {currentYear}
          </Text>
          <TouchableOpacity
            onPress={handleNextMonth}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Icon name="arrow-right-s-line" size={28} color={colors.text} />
          </TouchableOpacity>
        </Animated.View>

        {/* Day Labels */}
        <View style={s.dayLabelsRow}>
          {DAY_LABELS.map((label) => (
            <Text key={label} style={s.dayLabel}>
              {label}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <Animated.View style={[s.calendarGrid, calendarEntry]}>
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return (
                <CalendarDayCell
                  key={`pad-${idx}`}
                  date={null}
                  sessions={[]}
                  isToday={false}
                  isSelected={false}
                  onPress={() => {}}
                />
              );
            }
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const daySessions = byDate[dateStr] ?? [];
            return (
              <CalendarDayCell
                key={dateStr}
                date={day}
                sessions={daySessions}
                isToday={dateStr === todayStr}
                isSelected={dateStr === selectedDate}
                onPress={() => handleDayPress(day)}
              />
            );
          })}
        </Animated.View>

        {/* Month Summary Bar */}
        <Animated.View style={[s.summaryBar, summaryEntry]}>
          <View style={s.summaryItem}>
            <Icon
              name="calendar-event-line"
              size={16}
              color={colors.primary}
            />
            <Text style={s.summaryValue}>{totalSessions}</Text>
            <Text style={s.summaryLabel}>Total</Text>
          </View>
          <View style={s.summaryItem}>
            <Icon name="check-line" size={16} color={colors.success} />
            <Text style={s.summaryValue}>{completedCount}</Text>
            <Text style={s.summaryLabel}>Completed</Text>
          </View>
          <View style={s.summaryItem}>
            <Icon name="close-line" size={16} color={colors.error} />
            <Text style={s.summaryValue}>{cancelledCount}</Text>
            <Text style={s.summaryLabel}>Cancelled</Text>
          </View>
        </Animated.View>

        {/* Floating Today Button */}
        {!isViewingCurrentMonth && (
          <TouchableOpacity
            style={s.todayFab}
            onPress={handleTodayPress}
            activeOpacity={0.8}
          >
            <Icon name="focus-3-line" size={18} color={colors.white} />
            <Text style={s.todayFabText}>Today</Text>
          </TouchableOpacity>
        )}

        {/* Day Sheet */}
        <SessionDaySheet
          visible={showDaySheet}
          date={selectedDate ?? todayStr}
          sessions={selectedDate ? byDate[selectedDate] ?? [] : []}
          onClose={() => setShowDaySheet(false)}
          onRecordAttendance={handleRecordAttendance}
          onViewAttendance={handleViewAttendance}
        />
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  monthTitle: {
    ...typography.subheading,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },

  // Day labels
  dayLabelsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },

  // Calendar grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    paddingBottom: spacing.sm,
  },

  // Summary bar
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryValue: {
    ...typography.bodyMedium,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },

  // Today FAB
  todayFab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.pill,
    gap: 6,
    ...shadows.md,
  },
  todayFabText: {
    ...typography.caption,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.white,
  },
});
