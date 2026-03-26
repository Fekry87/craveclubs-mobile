import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  SectionList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Loader } from '../../components/common/Loader';
import { ErrorView } from '../../components/common/ErrorView';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon, IconName } from '../../components/common/Icon';
import { CoachSessionCard } from '../../components/features/coach/CoachSessionCard';
import { LiveSessionBanner } from '../../components/features/coach/LiveSessionBanner';
import { useAuthStore } from '../../store/auth.store';
import { useCoachStore } from '../../store/coach.store';
import { CoachSessionInterface } from '../../types/models.types';
import { CoachSessionsStackParamList } from '../../navigation/types';
import { getRelativeDate } from '../../utils/formatters';
import { colors, spacing, fontFamily, borderRadius, shadows } from '../../theme';

/* ═══ Enable LayoutAnimation on Android ═══ */

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ═══ Constants ═══ */

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPER_CARD_WIDTH = SCREEN_WIDTH - spacing.md * 2 - spacing.lg;

/* ═══ Navigation ═══ */

type SessionsNavProp = NativeStackNavigationProp<
  CoachSessionsStackParamList,
  'CoachSessionsList'
>;

/* ═══ Segment Config ═══ */

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

/* ═══ Date helpers ═══ */

const getTodayKey = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const isPastDate = (dateKey: string): boolean => {
  return dateKey < getTodayKey();
};

/* ═══ Sorting helpers ═══ */

const sortByDateAsc = (
  a: CoachSessionInterface,
  b: CoachSessionInterface,
): number => new Date(a.date).getTime() - new Date(b.date).getTime();

const sortByDateDesc = (
  a: CoachSessionInterface,
  b: CoachSessionInterface,
): number => new Date(b.date).getTime() - new Date(a.date).getTime();

const filterSessions = (
  sessions: CoachSessionInterface[],
  segment: SegmentKey,
): CoachSessionInterface[] => {
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

/* ═══ Date Grouping ═══ */

interface DateGroup {
  sessions: CoachSessionInterface[];
}

interface DateSection {
  title: string;
  isPast?: boolean;
  data: DateGroup[];
}

const groupSessionsByDate = (
  sessions: CoachSessionInterface[],
  pastExpanded: boolean,
): DateSection[] => {
  const groups: Record<string, CoachSessionInterface[]> = {};

  sessions.forEach((session) => {
    const dateKey = session.date.substring(0, 10);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(session);
  });

  const todayKey = getTodayKey();
  const pastSessions: CoachSessionInterface[] = [];
  const currentAndFutureSections: DateSection[] = [];

  // Separate past vs current+future
  Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([date, data]) => {
      if (date < todayKey) {
        pastSessions.push(...data);
      } else {
        currentAndFutureSections.push({
          title: date,
          data: [{ sessions: data }],
        });
      }
    });

  const result: DateSection[] = [];

  // Add collapsed "Past Sessions" group if there are past sessions
  if (pastSessions.length > 0) {
    if (pastExpanded) {
      // When expanded, show individual past date sections
      const pastGroups: Record<string, CoachSessionInterface[]> = {};
      pastSessions.forEach((session) => {
        const dateKey = session.date.substring(0, 10);
        if (!pastGroups[dateKey]) pastGroups[dateKey] = [];
        pastGroups[dateKey].push(session);
      });

      Object.entries(pastGroups)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([date, data]) => {
          result.push({
            title: date,
            isPast: true,
            data: [{ sessions: data }],
          });
        });
    } else {
      // When collapsed, add a single section with empty data (header-only)
      result.push({
        title: '__past__',
        isPast: true,
        data: [{ sessions: [] }],
      });
    }
  }

  // Add current and future sections
  result.push(...currentAndFutureSections);

  return result;
};

const isHighlightDate = (dateStr: string): boolean => {
  const label = getRelativeDate(dateStr);
  return label === 'Today' || label === 'Tomorrow';
};

/* ═══ Empty state messages per segment ═══ */

const EMPTY_CONFIG: Record<
  SegmentKey,
  { icon: IconName; title: string; message: string }
> = {
  all: {
    icon: 'calendar-event-line',
    title: 'No Sessions Yet',
    message: 'Your coaching sessions will show up here.',
  },
  upcoming: {
    icon: 'rocket-fill',
    title: 'No Upcoming Sessions',
    message: 'Tap + to create your first session!',
  },
  completed: {
    icon: 'trophy-line',
    title: 'No Completed Sessions',
    message: 'Sessions you complete will appear here.',
  },
};

/* ═══ List Header Component ═══ */

interface ListHeaderProps {
  firstName: string;
  liveSessions: CoachSessionInterface[];
  activeSegment: SegmentKey;
  segmentCounts: Record<SegmentKey, number>;
  onSegmentPress: (key: SegmentKey) => void;
  onLivePress: (id: number) => void;
}

const ListHeader: React.FC<ListHeaderProps> = ({
  firstName,
  liveSessions,
  activeSegment,
  segmentCounts,
  onSegmentPress,
  onLivePress,
}) => (
  <View style={s.headerContainer}>
    {/* Greeting */}
    <View style={s.greetingSection}>
      <Text style={s.greeting}>
        Hey, Coach{' '}
        <Text style={s.greetingName}>{firstName}</Text>!
      </Text>
      <Text style={s.greetingSub}>
        Let's manage your sessions today
      </Text>
    </View>

    {/* Live Session Banner */}
    {liveSessions.length > 0 && (
      <View style={s.bannerWrap}>
        <LiveSessionBanner
          session={liveSessions[0]}
          onPress={() => onLivePress(liveSessions[0].id)}
        />
      </View>
    )}

    {/* Segment Bar */}
    <View style={s.segmentBar}>
      {SEGMENTS.map((seg) => {
        const isActive = activeSegment === seg.key;
        const count = segmentCounts[seg.key];
        return (
          <TouchableOpacity
            key={seg.key}
            style={[
              s.segmentTab,
              isActive && s.segmentTabActive,
            ]}
            onPress={() => onSegmentPress(seg.key)}
            activeOpacity={0.7}
          >
            <Icon
              name={seg.icon}
              size={14}
              color={isActive ? colors.white : colors.textMuted}
            />
            <Text
              style={[
                s.segmentLabel,
                isActive && s.segmentLabelActive,
              ]}
            >
              {seg.label}
            </Text>
            <View
              style={[
                s.countBadge,
                isActive && s.countBadgeActive,
              ]}
            >
              <Text
                style={[
                  s.countText,
                  isActive && s.countTextActive,
                ]}
              >
                {count}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

/* ═══ Swiper Row Component ═══ */

interface SwiperRowProps {
  sessions: CoachSessionInterface[];
  onSessionPress: (id: number) => void;
}

const SwiperRow: React.FC<SwiperRowProps> = ({ sessions, onSessionPress }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { x: number } } }) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / (SWIPER_CARD_WIDTH + spacing.sm));
      setActiveIndex(index);
    },
    [],
  );

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SWIPER_CARD_WIDTH + spacing.sm}
        decelerationRate="fast"
        contentContainerStyle={s.swiperContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {sessions.map((session) => (
          <View key={session.id} style={s.swiperCard}>
            <CoachSessionCard
              session={session}
              onPress={() => onSessionPress(session.id)}
              index={0}
            />
          </View>
        ))}
      </ScrollView>

      {/* Dot indicators */}
      <View style={s.dotContainer}>
        {sessions.map((session, i) => (
          <View
            key={session.id}
            style={[s.dot, i === activeIndex && s.dotActive]}
          />
        ))}
      </View>
    </View>
  );
};

/* ═══ Screen Component ═══ */

export const CoachSessionsScreen: React.FC = () => {
  const navigation = useNavigation<SessionsNavProp>();
  const { user } = useAuthStore();
  const [activeSegment, setActiveSegment] = useState<SegmentKey>('upcoming');
  const [pastExpanded, setPastExpanded] = useState(false);

  /* ─── Chevron rotation ─── */
  const chevronRotation = useRef(new Animated.Value(0)).current;

  const {
    sessions,
    isSessionsLoading,
    sessionsError,
    currentPage,
    totalPages,
    fetchSessions,
    refreshSessions,
    dashboard,
    fetchDashboard,
  } = useCoachStore();

  /* ─── FAB press animation ─── */
  const fabScale = useRef(new Animated.Value(1)).current;

  const onFabPressIn = useCallback(() => {
    Animated.spring(fabScale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  }, [fabScale]);

  const onFabPressOut = useCallback(() => {
    Animated.spring(fabScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [fabScale]);

  /* ─── Data fetching ─── */
  useFocusEffect(
    useCallback(() => {
      fetchSessions(1);
      fetchDashboard();
      // eslint-disable-next-line -- run on focus only
    }, []),
  );

  const handleRefresh = useCallback(() => {
    refreshSessions();
    fetchDashboard();
  }, [refreshSessions, fetchDashboard]);

  const handleEndReached = useCallback(() => {
    if (!isSessionsLoading && currentPage < totalPages) {
      fetchSessions(currentPage + 1);
    }
  }, [isSessionsLoading, currentPage, totalPages, fetchSessions]);

  /* ─── Navigation handlers ─── */
  const handleSessionPress = useCallback(
    (sessionId: number) => {
      navigation.navigate('CoachSessionDetail', { sessionId });
    },
    [navigation],
  );

  const handleLivePress = useCallback(
    (sessionId: number) => {
      navigation.navigate('CoachSessionLive', { sessionId });
    },
    [navigation],
  );

  const handleCreatePress = useCallback(() => {
    navigation.navigate('CoachCreateSession');
  }, [navigation]);

  const handleSegmentPress = useCallback((key: SegmentKey) => {
    setActiveSegment(key);
  }, []);

  /* ─── Past sessions toggle ─── */
  const togglePast = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newExpanded = !pastExpanded;
    setPastExpanded(newExpanded);
    Animated.timing(chevronRotation, {
      toValue: newExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [pastExpanded, chevronRotation]);

  const chevronRotateStyle = useMemo(
    () => ({
      transform: [
        {
          rotate: chevronRotation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
          }),
        },
      ],
    }),
    [chevronRotation],
  );

  /* ─── Derived data ─── */
  const firstName = useMemo(() => {
    if (!user?.name) return 'Coach';
    return user.name.split(' ')[0];
  }, [user?.name]);

  const liveSessions = useMemo(
    () => dashboard?.live_sessions ?? [],
    [dashboard],
  );

  const filteredSessions = useMemo(
    () => filterSessions(sessions, activeSegment),
    [sessions, activeSegment],
  );

  const pastSessionCount = useMemo(() => {
    const todayKey = getTodayKey();
    return filteredSessions.filter(
      (s) => s.date.substring(0, 10) < todayKey,
    ).length;
  }, [filteredSessions]);

  const groupedSections = useMemo(
    () => groupSessionsByDate(filteredSessions, pastExpanded),
    [filteredSessions, pastExpanded],
  );

  const segmentCounts = useMemo(
    () => ({
      all: filterSessions(sessions, 'all').length,
      upcoming: filterSessions(sessions, 'upcoming').length,
      completed: filterSessions(sessions, 'completed').length,
    }),
    [sessions],
  );

  const emptyConfig = EMPTY_CONFIG[activeSegment];

  /* ─── SectionList renderers ─── */
  const renderSectionHeader = useCallback(
    ({ section }: { section: DateSection }) => {
      // Collapsed past sessions header
      if (section.title === '__past__') {
        return (
          <TouchableOpacity
            style={s.pastHeader}
            onPress={togglePast}
            activeOpacity={0.7}
          >
            <View style={s.pastHeaderLeft}>
              <Icon name="time-line" size={18} color={colors.textMuted} />
              <Text style={s.pastHeaderTitle}>Past Sessions</Text>
              <View style={s.pastCountBadge}>
                <Text style={s.pastCountText}>{pastSessionCount}</Text>
              </View>
            </View>
            <Animated.View style={chevronRotateStyle}>
              <Icon
                name="arrow-down-s-line"
                size={20}
                color={colors.textMuted}
              />
            </Animated.View>
          </TouchableOpacity>
        );
      }

      // Expanded past day header (with collapse toggle on first past section)
      if (section.isPast) {
        const dateLabel = getRelativeDate(section.title);
        const sessionCount = section.data[0].sessions.length;

        // Check if this is the first past section to show the collapse header
        const isFirstPastSection =
          groupedSections.length > 0 &&
          groupedSections[0].isPast &&
          groupedSections[0].title === section.title;

        return (
          <View>
            {isFirstPastSection && (
              <TouchableOpacity
                style={s.pastHeader}
                onPress={togglePast}
                activeOpacity={0.7}
              >
                <View style={s.pastHeaderLeft}>
                  <Icon name="time-line" size={18} color={colors.textMuted} />
                  <Text style={s.pastHeaderTitle}>Past Sessions</Text>
                  <View style={s.pastCountBadge}>
                    <Text style={s.pastCountText}>{pastSessionCount}</Text>
                  </View>
                </View>
                <Animated.View style={chevronRotateStyle}>
                  <Icon
                    name="arrow-down-s-line"
                    size={20}
                    color={colors.textMuted}
                  />
                </Animated.View>
              </TouchableOpacity>
            )}
            <View style={s.pastDateHeader}>
              <Text style={s.pastDateTitle}>{dateLabel}</Text>
              {sessionCount > 1 && (
                <View style={s.sessionCountBadge}>
                  <Text style={s.sessionCountText}>
                    {sessionCount} sessions
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      }

      // Current/future date header
      const dateLabel = getRelativeDate(section.title);
      const highlight = isHighlightDate(section.title);
      const sessionCount = section.data[0].sessions.length;

      return (
        <View style={s.sectionHeader}>
          <Text
            style={[
              s.dateTitle,
              highlight && s.dateTitleHighlight,
            ]}
          >
            {dateLabel}
          </Text>
          {sessionCount > 1 && (
            <View style={s.sessionCountBadge}>
              <Text style={s.sessionCountText}>
                {sessionCount} sessions
              </Text>
            </View>
          )}
        </View>
      );
    },
    [togglePast, chevronRotateStyle, pastSessionCount, groupedSections],
  );

  const renderItem = useCallback(
    ({ item }: { item: DateGroup }) => {
      // Empty data for collapsed past header
      if (item.sessions.length === 0) {
        return null;
      }

      if (item.sessions.length === 1) {
        return (
          <CoachSessionCard
            session={item.sessions[0]}
            onPress={() => handleSessionPress(item.sessions[0].id)}
            index={0}
          />
        );
      }

      return (
        <SwiperRow
          sessions={item.sessions}
          onSessionPress={handleSessionPress}
        />
      );
    },
    [handleSessionPress],
  );

  const keyExtractor = useCallback(
    (_item: DateGroup, index: number) => index.toString(),
    [],
  );

  /* ─── List header renderer ─── */
  const renderListHeader = useCallback(
    () => (
      <ListHeader
        firstName={firstName}
        liveSessions={liveSessions}
        activeSegment={activeSegment}
        segmentCounts={segmentCounts}
        onSegmentPress={handleSegmentPress}
        onLivePress={handleLivePress}
      />
    ),
    [firstName, liveSessions, activeSegment, segmentCounts, handleSegmentPress, handleLivePress],
  );

  /* ─── Loading & Error states ─── */
  if (sessionsError && sessions.length === 0) {
    return (
      <ErrorView
        message={sessionsError}
        onRetry={() => fetchSessions(1)}
      />
    );
  }

  if (isSessionsLoading && sessions.length === 0) {
    return <Loader message="Loading sessions..." />;
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Sessions SectionList grouped by date */}
      <SectionList
        sections={groupedSections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderListHeader}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={isSessionsLoading && sessions.length > 0}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          !isSessionsLoading ? (
            <EmptyState
              icon={emptyConfig.icon}
              title={emptyConfig.title}
              message={emptyConfig.message}
            />
          ) : null
        }
        contentContainerStyle={[
          s.listContent,
          groupedSections.length === 0 && s.listContentEmpty,
        ]}
      />

      {/* FAB — Create Session */}
      <Animated.View
        style={[s.fabOuter, { transform: [{ scale: fabScale }] }]}
      >
        <TouchableOpacity
          style={s.fab}
          onPress={handleCreatePress}
          onPressIn={onFabPressIn}
          onPressOut={onFabPressOut}
          activeOpacity={0.9}
        >
          <Icon name="add-line" size={28} color={colors.white} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

/* ═══ Styles ═══ */

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /* ─── List content ─── */
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  listContentEmpty: {
    flex: 1,
  },

  /* ─── Header container ─── */
  headerContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },

  /* ─── Greeting ─── */
  greetingSection: {
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 28,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    lineHeight: 34,
  },
  greetingName: {
    color: colors.primary,
  },
  greetingSub: {
    fontSize: 16,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  /* ─── Live banner wrapper ─── */
  bannerWrap: {
    marginBottom: spacing.lg,
  },

  /* ─── Segment bar ─── */
  segmentBar: {
    flexDirection: 'row',
    padding: spacing.xs,
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
  },
  segmentTabActive: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  segmentLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  segmentLabelActive: {
    color: colors.white,
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  countText: {
    fontSize: 10,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  countTextActive: {
    color: colors.white,
  },

  /* ─── Past Sessions Collapsible Header ─── */
  pastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  pastHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pastHeaderTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  pastCountBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  pastCountText: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },

  /* ─── Past Date Header (inside expanded) ─── */
  pastDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
  },
  pastDateTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textDim,
  },

  /* ─── Date Section Headers (current/future) ─── */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  dateTitle: {
    fontSize: 18,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  dateTitleHighlight: {
    color: colors.primary,
  },
  sessionCountBadge: {
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  sessionCountText: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },

  /* ─── Horizontal Swiper ─── */
  swiperContent: {
    paddingRight: spacing.sm,
  },
  swiperCard: {
    width: SWIPER_CARD_WIDTH,
    marginRight: spacing.sm,
  },

  /* ─── Dot Indicators ─── */
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },

  /* ─── FAB ─── */
  fabOuter: {
    position: 'absolute',
    bottom: 24,
    right: spacing.md,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
});
