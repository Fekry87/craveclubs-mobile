import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Loader } from '../../components/common/Loader';
import { ErrorView } from '../../components/common/ErrorView';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icon';
import { MeasurementRows } from '../../components/features/measurements/MeasurementRows';
import { MeasurementProgressChart } from '../../components/features/measurements/MeasurementProgressChart';
import { useMyMeasurementsStore } from '../../store/myMeasurements.store';
import { MeasurementDayInterface } from '../../types/models.types';
import { formatDate, getRelativeDate } from '../../utils/formatters';
import { colors, spacing, fontFamily, borderRadius, typography, shadows } from '../../theme';

interface DayCardProps {
  day: MeasurementDayInterface;
  expanded: boolean;
  onToggle: (date: string) => void;
}

/** One training day: tap the header to open its times. */
const DayCard: React.FC<DayCardProps> = React.memo(({ day, expanded, onToggle }) => {
  const relative = getRelativeDate(day.date);
  const full = formatDate(`${day.date}T00:00:00`);
  const isNamedDay = relative === 'Today' || relative === 'Yesterday' || relative === 'Tomorrow';

  return (
    <View style={s.card}>
      <TouchableOpacity
        style={s.cardHeader}
        onPress={() => onToggle(day.date)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${full}, ${day.count} ${day.count === 1 ? 'time' : 'times'}`}
      >
        <View style={[s.dateTile, { backgroundColor: colors.primaryDim }]}>
          <Icon name="calendar-event-line" size={20} color={colors.primary} />
        </View>
        <View style={s.cardTitleWrap}>
          <Text style={s.cardTitle} numberOfLines={1}>
            {isNamedDay ? relative : full}
          </Text>
          {isNamedDay && (
            <Text style={s.cardSubtitle} numberOfLines={1}>
              {full}
            </Text>
          )}
        </View>
        <View style={[s.countPill, { backgroundColor: colors.primaryDim }]}>
          <Text style={[s.countText, { color: colors.primary }]}>
            {day.count} {day.count === 1 ? 'time' : 'times'}
          </Text>
        </View>
        <Icon
          name={expanded ? 'arrow-up-s-line' : 'arrow-down-s-line'}
          size={22}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={s.cardBody}>
          <MeasurementRows measurements={day.measurements} showSession />
        </View>
      )}
    </View>
  );
});

/**
 * القياس — the swimmer's recorded times, one card per training day (newest
 * first); a card opens to the times swum that day. Lives under Progress as the
 * "My Measurements" tab. Read-only: coaches record the times during a session.
 */
export const MyMeasurementsScreen: React.FC = () => {
  const days = useMyMeasurementsStore((st) => st.days);
  const page = useMyMeasurementsStore((st) => st.page);
  const lastPage = useMyMeasurementsStore((st) => st.lastPage);
  const loaded = useMyMeasurementsStore((st) => st.loaded);
  const isLoading = useMyMeasurementsStore((st) => st.isLoading);
  const isRefreshing = useMyMeasurementsStore((st) => st.isRefreshing);
  const error = useMyMeasurementsStore((st) => st.error);
  const unavailable = useMyMeasurementsStore((st) => st.unavailable);
  const fetchDays = useMyMeasurementsStore((st) => st.fetchDays);
  const refresh = useMyMeasurementsStore((st) => st.refresh);
  const progress = useMyMeasurementsStore((st) => st.progress);
  const isProgressLoading = useMyMeasurementsStore((st) => st.isProgressLoading);
  const fetchProgress = useMyMeasurementsStore((st) => st.fetchProgress);

  /** Dates the swimmer opened or closed by hand; the newest day starts open. */
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  useFocusEffect(
    useCallback(() => {
      refresh();
      fetchProgress();
    }, [refresh, fetchProgress]),
  );

  const handleToggle = useCallback(
    (date: string) => {
      setToggled((prev) => {
        const current = prev[date] ?? days[0]?.date === date;
        return { ...prev, [date]: !current };
      });
    },
    [days],
  );

  const handleEndReached = useCallback(() => {
    if (loaded && !isLoading && page < lastPage) fetchDays(page + 1);
  }, [loaded, isLoading, page, lastPage, fetchDays]);

  const renderItem = useCallback(
    ({ item, index }: { item: MeasurementDayInterface; index: number }) => (
      <DayCard
        day={item}
        expanded={toggled[item.date] ?? index === 0}
        onToggle={handleToggle}
      />
    ),
    [toggled, handleToggle],
  );

  if (!loaded || (isLoading && days.length === 0 && !error)) {
    return <Loader message="Loading your times..." />;
  }

  if (error && days.length === 0) {
    return <ErrorView message={error} onRetry={() => fetchDays(1)} />;
  }

  return (
    <FlatList
      data={days}
      keyExtractor={(item) => item.date}
      renderItem={renderItem}
      contentContainerStyle={[s.list, days.length === 0 && s.listEmpty]}
      ListHeaderComponent={
        progress && progress.points.length > 0 ? (
          <MeasurementProgressChart
            progress={progress}
            loading={isProgressLoading}
            onPeriodChange={fetchProgress}
          />
        ) : null
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => refresh(true)}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      ListEmptyComponent={
        <EmptyState
          icon="timer-line"
          title={unavailable ? 'Not available' : 'No times yet'}
          message={
            unavailable
              ? "Your club doesn't record swim times in the app."
              : 'When your coach times your swims during a session, they show up here by day.'
          }
        />
      }
      ListFooterComponent={
        isLoading && days.length > 0 ? (
          <ActivityIndicator style={s.footer} color={colors.primary} />
        ) : null
      }
    />
  );
};

const s = StyleSheet.create({
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.sm + 4,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    padding: spacing.md,
  },
  dateTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  countPill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  countText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
  },
  cardBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footer: {
    paddingVertical: spacing.md,
  },
});
