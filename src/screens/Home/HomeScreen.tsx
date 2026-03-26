import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { ErrorView } from '../../components/common/ErrorView';
import { Icon } from '../../components/common/Icon';
import { StatCard } from '../../components/features/progress/StatCard';
import { SessionCard } from '../../components/features/sessions/SessionCard';
import { SessionSummaryPopup } from '../../components/features/sessions/SessionSummaryPopup';
import { WelcomeConfetti } from '../../components/features/notifications/WelcomeConfetti';
import { LevelCharacter } from '../../components/features/leaderboard/LevelCharacter';
import { useAuthStore } from '../../store/auth.store';
import { useSessionSummaryStore } from '../../store/sessionSummary.store';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { useSessionCompletionDetector } from '../../hooks/useSessionCompletionDetector';
import { setDashboardRefreshCallback } from '../../hooks/useRealtime';
import { progressService } from '../../api/services/progress.service';
import { sessionService } from '../../api/services/session.service';
import { DashboardResponseType, LeaderboardResponseType } from '../../types/api.types';
import { TrainingSessionInterface } from '../../types/models.types';
import { AppTabParamList } from '../../navigation/types';
import { formatRating } from '../../utils/formatters';
import { colors, spacing, fontFamily, borderRadius, shadows } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SESSION_CARD_WIDTH = SCREEN_WIDTH - spacing.md * 2 - spacing.lg;

type HomeNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const HomeScreen: React.FC = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<HomeNavProp>();
  const [dashboard, setDashboard] = useState<DashboardResponseType | null>(
    null,
  );
  const [leaderboard, setLeaderboard] =
    useState<LeaderboardResponseType | null>(null);
  const [sessions, setSessions] = useState<TrainingSessionInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /* ─── Session Summary Popup ─── */
  const {
    isVisible: summaryVisible,
    summaryData,
    completedSessionId,
    dismiss: dismissSummary,
  } = useSessionSummaryStore();
  const { checkForCompletions } = useSessionCompletionDetector();
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchRef = useRef<(() => Promise<void>) | null>(null);

  const greetingEntry = useAnimatedEntry(0);
  const levelStatEntry = useAnimatedEntry(0);
  const sessionsEntry = useAnimatedEntry(3);
  const evalsEntry = useAnimatedEntry(4);

  const hasDataRef = useRef(false);

  /** Full fetch — shows loading/error only when no data exists yet. */
  const fetchDashboard = useCallback(async () => {
    try {
      const [dashData, lbData, sessionsData] = await Promise.all([
        progressService.getDashboard(),
        progressService.getLeaderboard(),
        sessionService.getSessions(1, 50),
      ]);
      setDashboard(dashData);
      setLeaderboard(lbData);
      setSessions(sessionsData.data);
      setError(null);
      hasDataRef.current = true;

      // Polling fallback: detect session completions
      checkForCompletions(sessionsData.data);
    } catch {
      // Only show error if there's no existing data to display
      if (!hasDataRef.current) {
        setError('Failed to load dashboard.');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line -- checkForCompletions is stable from the hook
  }, []);

  /** Silent poll — keeps existing data, no loading/error UI changes. */
  const silentPoll = useCallback(async () => {
    try {
      const [dashData, lbData, sessionsData] = await Promise.all([
        progressService.getDashboard(),
        progressService.getLeaderboard(),
        sessionService.getSessions(1, 50),
      ]);
      setDashboard(dashData);
      setLeaderboard(lbData);
      setSessions(sessionsData.data);
      checkForCompletions(sessionsData.data);
    } catch {
      // Silent fail — keep showing existing data
    }
    // eslint-disable-next-line
  }, []);

  // Keep a stable ref so polling always calls the latest version
  fetchRef.current = silentPoll;

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
      // Register for real-time dashboard refresh (attendance, evaluations)
      setDashboardRefreshCallback(() => silentPoll());
      return () => setDashboardRefreshCallback(null);
      // eslint-disable-next-line
    }, []),
  );

  /* ─── Auto-poll when a Live session exists (only if no error) ─── */
  useEffect(() => {
    // Don't poll if there's an error — user must tap "Try Again"
    if (error) return;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const hasActiveSession = sessions.some(
      (s) =>
        s.status === 'Live' && s.date.startsWith(todayStr),
    );

    if (hasActiveSession) {
      pollIntervalRef.current = setInterval(() => {
        fetchRef.current?.();
      }, 10000); // 10s — only during active Live sessions
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [sessions, error]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, [fetchDashboard]);

  const navigateToSessions = useCallback(() => {
    navigation.navigate('Sessions');
  }, [navigation]);

  const navigateToEvaluations = useCallback(() => {
    navigation.navigate('Evaluations');
  }, [navigation]);

  /* ─── Popup handlers ─── */
  const handleDismissSummary = useCallback(() => {
    dismissSummary();
  }, [dismissSummary]);

  if (isLoading) {
    return <Loader message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={fetchDashboard} />;
  }

  if (!dashboard) {
    return <ErrorView message="No data available." onRetry={fetchDashboard} />;
  }

  // Show only today's session (Scheduled or Live) from sessions API
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todaySessions = sessions
    .filter(
      (s) =>
        (s.status === 'Scheduled' || s.status === 'Live') &&
        s.date.startsWith(todayStr),
    )
    .sort(
      (a, b) =>
        a.start_time.localeCompare(b.start_time),
    );

  // Find the completed session for the popup
  const completedSession = completedSessionId
    ? sessions.find((s) => s.id === completedSessionId) ?? null
    : null;

  return (
    <>
    <ScrollView
      style={screenStyles.container}
      contentContainerStyle={screenStyles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* ═══ Greeting — clean, no icon ═══ */}
      <Animated.View style={[screenStyles.greetingSection, greetingEntry]}>
        <Text style={screenStyles.greeting}>
          Hey{' '}
          <Text style={screenStyles.greetingName}>
            {dashboard.profile.first_name}
          </Text>
          !
        </Text>
        <Text style={screenStyles.greetingSub}>
          Ready to make a splash today?
        </Text>
      </Animated.View>

      {/* ═══ Stats Row ═══ */}
      <View style={screenStyles.statsRow}>
        {leaderboard ? (
          <Animated.View style={[{ flex: 1 }, levelStatEntry]}>
            <Card glowColor={leaderboard.my_level.color}>
              <View style={screenStyles.levelContent}>
                <View
                  style={[
                    screenStyles.levelIconBox,
                    {
                      backgroundColor: `${leaderboard.my_level.color}18`,
                    },
                  ]}
                >
                  <LevelCharacter
                    levelName={leaderboard.my_level.name}
                    size={32}
                  />
                </View>
                <Text
                  style={[
                    screenStyles.levelXpValue,
                    { color: leaderboard.my_level.color },
                  ]}
                >
                  {leaderboard.my_xp.total_xp.toLocaleString()}
                </Text>
                <Text style={screenStyles.levelStatLabel}>XP</Text>
              </View>
            </Card>
          </Animated.View>
        ) : (
          <StatCard
            icon="flashlight-fill"
            value="–"
            label="XP"
            color="primary"
            index={0}
          />
        )}
        <StatCard
          icon="star-fill"
          value={formatRating(dashboard.average_rating)}
          label="Avg Rating"
          color="warning"
          index={1}
        />
        <StatCard
          icon="award-fill"
          value={dashboard.sessions_attended.toString()}
          label="Attended"
          color="success"
          index={2}
        />
      </View>

      {/* ═══ Today's Sessions ═══ */}
      <Animated.View style={[screenStyles.section, sessionsEntry]}>
        <View style={screenStyles.sectionHeader}>
          <Text style={screenStyles.sectionTitle}>Today's Sessions</Text>
          <TouchableOpacity
            onPress={navigateToSessions}
            style={screenStyles.seeAllBtn}
            activeOpacity={0.7}
          >
            <Text style={screenStyles.seeAllText}>See All</Text>
            <Icon
              name="arrow-right-s-line"
              size={16}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {todaySessions.length > 0 ? (
          todaySessions.length === 1 ? (
            <SessionCard
              key={todaySessions[0].id}
              session={todaySessions[0]}
              index={0}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SESSION_CARD_WIDTH + spacing.sm}
              decelerationRate="fast"
              contentContainerStyle={screenStyles.sessionSwiperContent}
            >
              {todaySessions.map((s, i) => (
                <View key={s.id} style={screenStyles.sessionSwiperCard}>
                  <SessionCard session={s} index={0} />
                </View>
              ))}
            </ScrollView>
          )
        ) : (
          <Card style={screenStyles.noSessionsCard}>
            <View style={screenStyles.noSessionsContent}>
              <View style={screenStyles.noSessionsIconCircle}>
                <Icon
                  name="calendar-event-line"
                  size={24}
                  color={colors.textDim}
                />
              </View>
              <Text style={screenStyles.noSessionsTitle}>
                No sessions today
              </Text>
              <Text style={screenStyles.noSessionsMsg}>
                Enjoy your rest day! Check back tomorrow.
              </Text>
            </View>
          </Card>
        )}
      </Animated.View>

      {/* ═══ Latest Evaluation — taps to Progress ═══ */}
      {dashboard.recent_evaluations?.length > 0 && dashboard.recent_evaluations[0] && (
        <Animated.View style={[screenStyles.section, evalsEntry]}>
          <View style={screenStyles.sectionHeader}>
            <Text style={screenStyles.sectionTitle}>Latest Evaluation</Text>
            <TouchableOpacity
              onPress={navigateToEvaluations}
              style={screenStyles.seeAllBtn}
              activeOpacity={0.7}
            >
              <Text style={screenStyles.seeAllText}>See All</Text>
              <Icon
                name="arrow-right-s-line"
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {(() => {
            const evaluation = dashboard.recent_evaluations[0];
            const emptyStars = 5 - evaluation.rating;
            const evalDate = new Date(evaluation.session?.date ?? evaluation.created_at ?? Date.now());
            const dateLabel = evalDate.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            return (
              <Card
                key={evaluation.id}
                style={screenStyles.evalCard}
                accentColor={colors.warning}
              >
                <View style={screenStyles.evalRow}>
                  <View style={screenStyles.evalStarCircle}>
                    <Icon name="star-fill" size={22} color={colors.warning} />
                  </View>
                  <View style={screenStyles.evalContent}>
                    <View style={screenStyles.evalStars}>
                      {Array.from({ length: evaluation.rating }).map(
                        (_, i) => (
                          <Icon
                            key={`f-${i}`}
                            name="star-fill"
                            size={16}
                            color={colors.warning}
                          />
                        ),
                      )}
                      {Array.from({ length: emptyStars }).map((_, i) => (
                        <Icon
                          key={`e-${i}`}
                          name="star-line"
                          size={16}
                          color={colors.borderLight}
                        />
                      ))}
                      <Text style={screenStyles.evalRatingText}>
                        {evaluation.rating}.0
                      </Text>
                    </View>
                    <Text style={screenStyles.evalGroupName}>
                      {evaluation.session?.group?.name ?? 'Training Session'}
                    </Text>
                    {evaluation.notes && (
                      <Text style={screenStyles.evalNotes} numberOfLines={2}>
                        {evaluation.notes}
                      </Text>
                    )}
                  </View>
                  <Text style={screenStyles.evalDate}>{dateLabel}</Text>
                </View>
              </Card>
            );
          })()}
        </Animated.View>
      )}
    </ScrollView>

    {/* ═══ Session Completion Celebratory Popup ═══ */}
    <SessionSummaryPopup
      visible={summaryVisible}
      onDismiss={handleDismissSummary}
      session={completedSession}
      dashboard={summaryData.dashboard}
      leaderboard={summaryData.leaderboard}
    />

    {/* ═══ Welcome Confetti (registration_approved — plays once) ═══ */}
    <WelcomeConfetti trigger={!isLoading} />
    </>
  );
};

const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },

  /* ═══ Greeting — no icon, clean layout ═══ */
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

  /* ═══ Stats ═══ */
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  levelContent: {
    alignItems: 'center',
  },
  levelIconBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  levelXpValue: {
    fontSize: 24,
    fontFamily: fontFamily.headingBold,
    marginBottom: spacing.xs,
  },
  levelStatLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    textAlign: 'center',
  },

  /* ═══ Sections ═══ */
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },

  /* ═══ Session Swiper ═══ */
  sessionSwiperContent: {
    paddingRight: spacing.sm,
  },
  sessionSwiperCard: {
    width: SESSION_CARD_WIDTH,
    marginRight: spacing.sm,
  },

  /* ═══ No sessions ═══ */
  noSessionsCard: {
    marginBottom: spacing.sm,
  },
  noSessionsContent: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  noSessionsIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  noSessionsTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  noSessionsMsg: {
    fontSize: 13,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    textAlign: 'center',
  },

  /* ═══ Latest Evaluation ═══ */
  evalCard: {
    marginBottom: spacing.sm,
  },
  evalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  evalStarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.warningDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  evalContent: {
    flex: 1,
  },
  evalStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: spacing.xs,
  },
  evalRatingText: {
    fontSize: 14,
    fontFamily: fontFamily.headingBold,
    color: colors.warning,
    marginLeft: 6,
  },
  evalGroupName: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  evalNotes: {
    fontSize: 13,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 2,
  },
  evalDate: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },
});
