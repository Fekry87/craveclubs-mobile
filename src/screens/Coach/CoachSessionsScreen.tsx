import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
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

/* ═══ Date Grouping ═══ */

interface DateGroup {
  sessions: CoachSessionInterface[];
}

interface DateSection {
  title: string;
  isPast: boolean;
  /** First past day on the All tab: draws the "Past sessions" divider above it. */
  startsPast: boolean;
  data: DateGroup[];
}

/**
 * Group one tab's rows by day, keeping the server's order: the tabs are
 * filtered, sorted and paginated there (soonest first for Upcoming, latest
 * first for Completed, upcoming then past for All), so re-sorting here would
 * shuffle rows every time another page arrives. On All, the first past day
 * carries the "Past sessions" divider.
 */
const groupSessionsByDate = (
  sessions: CoachSessionInterface[],
  segment: SegmentKey,
): DateSection[] => {
  const todayKey = getTodayKey();
  const sections: DateSection[] = [];

  sessions.forEach((session) => {
    const dateKey = session.date.substring(0, 10);
    const last = sections[sections.length - 1];
    if (last && last.title === dateKey) {
      last.data[0].sessions.push(session);
      return;
    }
    sections.push({
      title: dateKey,
      // Only All mixes the two; on Completed every day is past, so none is dimmed.
      isPast: segment === 'all' && dateKey < todayKey,
      startsPast: false,
      data: [{ sessions: [session] }],
    });
  });

  const firstPast = sections.find((section) => section.isPast);
  if (firstPast) firstPast.startsPast = true;

  return sections;
};

/** A row of the screen's flat list. */
type ListRow =
  | { kind: 'tabs' }
  | { kind: 'status' }
  | { kind: 'date'; section: DateSection }
  | { kind: 'sessions'; sessions: CoachSessionInterface[] };

/**
 * The segment bar is the first data row. With a ListHeaderComponent the list
 * puts the header at child 0, so the first data row is child 1.
 */
const STICKY_TABS = [1];

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

/* ═══ List Header: greeting + live banner (scrolls away) ═══ */

interface ListHeaderProps {
  firstName: string;
  liveSessions: CoachSessionInterface[];
  onLivePress: (id: number) => void;
}

const ListHeader: React.FC<ListHeaderProps> = ({
  firstName,
  liveSessions,
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

  </View>
);

/* ═══ Segment Bar: the list's first row, pinned to the top while scrolling ═══ */

interface SegmentBarProps {
  activeSegment: SegmentKey;
  /** null until the server (or a first load) says how many. */
  segmentCounts: Record<SegmentKey, number | null>;
  onSegmentPress: (key: SegmentKey) => void;
}

const SegmentBar: React.FC<SegmentBarProps> = ({
  activeSegment,
  segmentCounts,
  onSegmentPress,
}) => (
  <View style={s.stickyBar}>
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
            {count !== null && (
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
            )}
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

  const {
    segments,
    sessionCounts,
    fetchSegment,
    refreshSegment,
    dashboard,
    fetchDashboard,
  } = useCoachStore();
  const segment = segments[activeSegment];

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
      refreshSegment(activeSegment);
      fetchDashboard();
    }, [activeSegment, refreshSegment, fetchDashboard]),
  );

  const handleRefresh = useCallback(() => {
    refreshSegment(activeSegment, true);
    fetchDashboard();
  }, [activeSegment, refreshSegment, fetchDashboard]);

  const handleEndReached = useCallback(() => {
    if (segment.loaded && !segment.isLoading && segment.page < segment.lastPage) {
      fetchSegment(activeSegment, segment.page + 1);
    }
  }, [activeSegment, segment, fetchSegment]);

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

  /* ─── Derived data ─── */
  const firstName = useMemo(() => {
    if (!user?.name) return 'Coach';
    return user.name.split(' ')[0];
  }, [user?.name]);

  const liveSessions = useMemo(
    () => dashboard?.live_sessions ?? [],
    [dashboard],
  );

  const groupedSections = useMemo(
    () => groupSessionsByDate(segment.items, activeSegment),
    [segment.items, activeSegment],
  );

  // Badges come from the server, so they are right before a tab is opened.
  // Against a backend without `counts`, show what each opened tab has loaded.
  const segmentCounts = useMemo(() => {
    const countFor = (key: SegmentKey): number | null =>
      sessionCounts?.[key] ?? (segments[key].loaded ? segments[key].items.length : null);
    return {
      all: countFor('all'),
      upcoming: countFor('upcoming'),
      completed: countFor('completed'),
    };
  }, [sessionCounts, segments]);

  const emptyConfig = EMPTY_CONFIG[activeSegment];

  /*
   * One flat list: the segment bar is its first row and the only sticky one,
   * so the greeting scrolls away and the tabs stay at the top. (A SectionList
   * can only pin every section header or none.) The empty / loading / error
   * state is a row too, because the list is never empty with the bar in it.
   */
  const rows = useMemo<ListRow[]>(() => {
    const out: ListRow[] = [{ kind: 'tabs' }];
    if (groupedSections.length === 0) {
      out.push({ kind: 'status' });
      return out;
    }
    groupedSections.forEach((section) => {
      out.push({ kind: 'date', section });
      out.push({ kind: 'sessions', sessions: section.data[0].sessions });
    });
    return out;
  }, [groupedSections]);

  const renderDateHeader = useCallback((section: DateSection) => {
    const dateLabel = getRelativeDate(section.title);
    const highlight = isHighlightDate(section.title);
    const sessionCount = section.data[0].sessions.length;

    return (
      <View>
        {section.startsPast && (
          <View style={s.pastHeader}>
            <Icon name="time-line" size={18} color={colors.textMuted} />
            <Text style={s.pastHeaderTitle}>Past sessions</Text>
          </View>
        )}
        <View style={section.isPast ? s.pastDateHeader : s.sectionHeader}>
          <Text
            style={
              section.isPast
                ? s.pastDateTitle
                : [s.dateTitle, highlight && s.dateTitleHighlight]
            }
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
      </View>
    );
  }, []);

  const renderStatus = useCallback(
    () => (
      <View style={s.statusRow}>
        {segment.error ? (
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
        )}
      </View>
    ),
    [segment.error, segment.loaded, segment.isLoading, activeSegment, fetchSegment, emptyConfig],
  );

  const renderItem = useCallback(
    ({ item }: { item: ListRow }) => {
      switch (item.kind) {
        case 'tabs':
          return (
            <SegmentBar
              activeSegment={activeSegment}
              segmentCounts={segmentCounts}
              onSegmentPress={handleSegmentPress}
            />
          );
        case 'status':
          return renderStatus();
        case 'date':
          return renderDateHeader(item.section);
        default:
          return item.sessions.length === 1 ? (
            <CoachSessionCard
              session={item.sessions[0]}
              onPress={() => handleSessionPress(item.sessions[0].id)}
              index={0}
            />
          ) : (
            <SwiperRow
              sessions={item.sessions}
              onSessionPress={handleSessionPress}
            />
          );
      }
    },
    [
      activeSegment,
      segmentCounts,
      handleSegmentPress,
      handleSessionPress,
      renderStatus,
      renderDateHeader,
    ],
  );

  const keyExtractor = useCallback((item: ListRow) => {
    switch (item.kind) {
      case 'date':
        return `date-${item.section.title}`;
      case 'sessions':
        return `sessions-${item.sessions[0].id}`;
      default:
        return item.kind;
    }
  }, []);

  /* ─── List header renderer ─── */
  const renderListHeader = useCallback(
    () => (
      <ListHeader
        firstName={firstName}
        liveSessions={liveSessions}
        onLivePress={handleLivePress}
      />
    ),
    [firstName, liveSessions, handleLivePress],
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <FlatList
        data={rows}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={renderListHeader}
        stickyHeaderIndices={STICKY_TABS}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={segment.isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListFooterComponent={
          segment.isLoading && segment.items.length > 0 ? (
            <ActivityIndicator style={s.footerLoader} color={colors.primary} />
          ) : null
        }
        contentContainerStyle={s.listContent}
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
  statusRow: {
    minHeight: 340,
    justifyContent: 'center',
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
  // Full-bleed and opaque, so cards pass under it cleanly while it is pinned.
  stickyBar: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
  },
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
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pastHeaderTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },

  /* ─── Past Date Header (All tab, under the divider) ─── */
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
  footerLoader: {
    paddingVertical: spacing.md,
  },
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
