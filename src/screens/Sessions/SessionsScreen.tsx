import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { SessionCard } from '../../components/features/sessions/SessionCard';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorView } from '../../components/common/ErrorView';
import { Loader } from '../../components/common/Loader';
import { Icon, IconName } from '../../components/common/Icon';
import { useSessionStore, SessionSegment } from '../../store/session.store';
import { colors, spacing, fontFamily, borderRadius } from '../../theme';
import { GLASS_TABBAR_CONTENT_INSET } from '../../components/common/GlassTabBar/styles';

type SegmentKey = SessionSegment;

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
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeSegment, setActiveSegment] = useState<SegmentKey>('upcoming');

  const segments = useSessionStore((st) => st.segments);
  const counts = useSessionStore((st) => st.counts);
  const fetchSegment = useSessionStore((st) => st.fetchSegment);
  const refreshSegment = useSessionStore((st) => st.refreshSegment);

  const segment = segments[activeSegment];

  // On focus and on every tab switch: load the tab the first time, refresh it
  // (keeping what was scrolled) after that. Global polling refreshes it too.
  useFocusEffect(
    useCallback(() => {
      refreshSegment(activeSegment);
    }, [activeSegment, refreshSegment]),
  );

  const handleRefresh = useCallback(() => {
    refreshSegment(activeSegment, true);
  }, [activeSegment, refreshSegment]);

  const handleEndReached = useCallback(() => {
    if (segment.loaded && !segment.isLoading && segment.page < segment.lastPage) {
      fetchSegment(activeSegment, segment.page + 1);
    }
  }, [activeSegment, segment, fetchSegment]);

  const emptyConfig = EMPTY_CONFIG[activeSegment];

  /** Server count when known; otherwise what that tab has loaded, if anything. */
  const badgeCount = (key: SegmentKey): number | null =>
    counts?.[key] ?? (segments[key].loaded ? segments[key].items.length : null);

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
                isActive && { backgroundColor: colors.primaryDim },
              ]}
              onPress={() => setActiveSegment(seg.key)}
              activeOpacity={0.7}
            >
              <Icon
                name={seg.icon}
                size={16}
                color={isActive ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  screenStyles.segmentLabel,
                  isActive && { color: colors.primary },
                ]}
              >
                {seg.label}
              </Text>
              {/* Count badge */}
              {badgeCount(seg.key) !== null && (
              <View
                style={[
                  screenStyles.countBadge,
                  isActive && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    screenStyles.countText,
                    isActive && screenStyles.countTextActive,
                  ]}
                >
                  {badgeCount(seg.key)}
                </Text>
              </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sessions List */}
      <FlatList
        data={segment.items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <SessionCard
            session={item}
            index={index}
            onPress={() => navigation.navigate('SessionDetail', { sessionId: item.id })}
          />
        )}
        contentContainerStyle={[
          screenStyles.listContent,
          { paddingBottom: GLASS_TABBAR_CONTENT_INSET },
          segment.items.length === 0 && screenStyles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={segment.isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          segment.error ? (
            <ErrorView
              message={segment.error}
              onRetry={() => fetchSegment(activeSegment)}
            />
          ) : !segment.loaded || segment.isLoading ? (
            <Loader message="Loading sessions..." />
          ) : (
            <EmptyState
              icon={emptyConfig.icon}
              title={emptyConfig.title}
              message={emptyConfig.message}
            />
          )
        }
        ListFooterComponent={
          segment.isLoading && segment.items.length > 0 ? (
            <ActivityIndicator style={screenStyles.footerLoader} color={colors.primary} />
          ) : null
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

  // Segment chips
  segmentScroll: {
    flexGrow: 0,
  },
  segmentBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm + 4,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  segmentTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surfaceLight,
    flexShrink: 0,
  },
  segmentLabel: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
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
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
  },
  listContentEmpty: {
    flex: 1,
  },
  footerLoader: {
    paddingVertical: spacing.md,
  },
});
