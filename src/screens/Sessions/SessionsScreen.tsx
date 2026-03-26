import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SessionCard } from '../../components/features/sessions/SessionCard';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorView } from '../../components/common/ErrorView';
import { Loader } from '../../components/common/Loader';
import { Icon, IconName } from '../../components/common/Icon';
import { useSessionStore } from '../../store/session.store';
import { TrainingSessionInterface } from '../../types/models.types';
import { colors, spacing, fontFamily, borderRadius } from '../../theme';

type SegmentKey = 'all' | 'upcoming' | 'completed';

interface SegmentConfig {
  key: SegmentKey;
  label: string;
  icon: IconName;
}

const SEGMENTS: SegmentConfig[] = [
  { key: 'all', label: 'All', icon: 'list-check-2' },
  { key: 'upcoming', label: 'Upcoming', icon: 'calendar-event-line' },
  { key: 'completed', label: 'Completed', icon: 'check-line' },
];

/** Sort sessions by date ascending (today first, then nearest) */
const sortByDateAsc = (
  a: TrainingSessionInterface,
  b: TrainingSessionInterface,
): number => new Date(a.date).getTime() - new Date(b.date).getTime();

/** Sort sessions by date descending (most recent first) */
const sortByDateDesc = (
  a: TrainingSessionInterface,
  b: TrainingSessionInterface,
): number => new Date(b.date).getTime() - new Date(a.date).getTime();

const filterSessions = (
  sessions: TrainingSessionInterface[],
  segment: SegmentKey,
): TrainingSessionInterface[] => {
  switch (segment) {
    case 'upcoming':
      return sessions
        .filter((s) => s.status === 'Scheduled' || s.status === 'Live')
        .sort(sortByDateAsc);
    case 'completed':
      return sessions
        .filter((s) => s.status === 'Completed' || s.status === 'Cancelled')
        .sort(sortByDateDesc);
    default:
      return [...sessions].sort(sortByDateAsc);
  }
};

const EMPTY_CONFIG: Record<
  SegmentKey,
  { icon: IconName; title: string; message: string }
> = {
  all: {
    icon: 'calendar-event-line',
    title: 'No Sessions Yet',
    message: 'Your training sessions will show up here.',
  },
  upcoming: {
    icon: 'rocket-fill',
    title: 'No Upcoming Sessions',
    message: 'Check back soon — new sessions are coming!',
  },
  completed: {
    icon: 'trophy-line',
    title: 'No Completed Sessions',
    message: 'Start attending sessions to see your history!',
  },
};

export const SessionsScreen: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<SegmentKey>('upcoming');

  const {
    sessions,
    isLoading,
    error,
    currentPage,
    totalPages,
    fetchSessions,
    refreshSessions,
  } = useSessionStore();

  // Fetch on focus — global polling in AppNavigator handles background refresh
  useFocusEffect(
    useCallback(() => {
      fetchSessions();
      // eslint-disable-next-line -- run on focus only, store function is stable
    }, []),
  );

  const handleRefresh = useCallback(() => {
    refreshSessions();
  }, [refreshSessions]);

  const handleEndReached = useCallback(() => {
    if (!isLoading && currentPage < totalPages) {
      fetchSessions(currentPage + 1);
    }
  }, [isLoading, currentPage, totalPages, fetchSessions]);

  const filteredSessions = useMemo(
    () => filterSessions(sessions, activeSegment),
    [sessions, activeSegment],
  );

  const emptyConfig = EMPTY_CONFIG[activeSegment];

  if (error && sessions.length === 0) {
    return <ErrorView message={error} onRetry={() => fetchSessions()} />;
  }

  if (isLoading && sessions.length === 0) {
    return <Loader message="Loading sessions..." />;
  }

  return (
    <View style={screenStyles.container}>
      {/* Segment Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={screenStyles.segmentBar}
        style={screenStyles.segmentScroll}
      >
        {SEGMENTS.map((seg) => {
          const isActive = activeSegment === seg.key;
          return (
            <TouchableOpacity
              key={seg.key}
              style={[
                screenStyles.segmentTab,
                isActive && screenStyles.segmentTabActive,
              ]}
              onPress={() => setActiveSegment(seg.key)}
              activeOpacity={0.7}
            >
              <Icon
                name={seg.icon}
                size={16}
                color={isActive ? colors.white : colors.textMuted}
              />
              <Text
                style={[
                  screenStyles.segmentLabel,
                  isActive && screenStyles.segmentLabelActive,
                ]}
              >
                {seg.label}
              </Text>
              {/* Count badge */}
              <View
                style={[
                  screenStyles.countBadge,
                  isActive && screenStyles.countBadgeActive,
                ]}
              >
                <Text
                  style={[
                    screenStyles.countText,
                    isActive && screenStyles.countTextActive,
                  ]}
                >
                  {filterSessions(sessions, seg.key).length}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sessions List */}
      <FlatList
        data={filteredSessions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <SessionCard
            session={item}
            index={index}
          />
        )}
        contentContainerStyle={[
          screenStyles.listContent,
          filteredSessions.length === 0 && screenStyles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && sessions.length > 0}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <EmptyState
            icon={emptyConfig.icon}
            title={emptyConfig.title}
            message={emptyConfig.message}
          />
        }
      />
    </View>
  );
};

const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Segment tabs
  segmentScroll: {
    flexGrow: 0,
  },
  segmentBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  segmentTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    flexShrink: 0,
  },
  segmentTabActive: {
    backgroundColor: colors.primary,
  },
  segmentLabel: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  segmentLabelActive: {
    color: colors.white,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  countText: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  countTextActive: {
    color: colors.white,
  },

  // List
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  listContentEmpty: {
    flex: 1,
  },
});
