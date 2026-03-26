import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  StyleSheet,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from '../../components/common/Icon';
import { Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { ErrorView } from '../../components/common/ErrorView';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { useAnimatedPress } from '../../hooks/useAnimatedPress';
import { managerService } from '../../api/services/manager.service';
import { CoachPerformanceSummary } from '../../types/analytics.types';
import {
  colors,
  spacing,
  fontFamily,
  borderRadius,
  shadows,
  typography,
  ANIMATION,
} from '../../theme';

type TabKey = 'performance';

// ── Rank badge colors ────────────────────────────────────────────────
const RANK_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: colors.warning, text: colors.warningDark },
  2: { bg: colors.textDim, text: colors.text },
  3: { bg: colors.orange, text: colors.orangeDark },
};

const DEFAULT_RANK = { bg: colors.surfaceLight, text: colors.textMuted };

// ── Coach Performance Card ───────────────────────────────────────────
const CoachPerformanceCard: React.FC<{
  coach: CoachPerformanceSummary;
  index: number;
  onPress: () => void;
}> = React.memo(({ coach, index, onPress }) => {
  const entry = useAnimatedEntry(Math.min(index, 10));
  const press = useAnimatedPress();
  const rankStyle = RANK_COLORS[coach.rank] ?? DEFAULT_RANK;
  const attendancePct = Math.round(coach.avg_attendance);

  return (
    <Animated.View style={entry}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        activeOpacity={0.7}
      >
        <Animated.View style={[s.coachCard, press.animatedStyle]}>
          {/* Rank badge */}
          <View style={[s.rankBadge, { backgroundColor: rankStyle.bg }]}>
            <Text style={[s.rankText, { color: rankStyle.text }]}>
              #{coach.rank}
            </Text>
          </View>

          {/* Coach info */}
          <View style={s.coachInfo}>
            <Text style={s.coachName} numberOfLines={1}>
              {coach.coach_name}
            </Text>
            <View style={s.coachStats}>
              <View style={s.statChip}>
                <Icon name="percent-line" size={12} color={colors.swimmer} />
                <Text style={[s.statText, { color: colors.swimmer }]}>
                  {attendancePct}%
                </Text>
              </View>
              {coach.avg_rating !== null && (
                <View style={s.statChip}>
                  <Icon name="star-fill" size={12} color={colors.warning} />
                  <Text style={[s.statText, { color: colors.warningDark }]}>
                    {coach.avg_rating.toFixed(1)}
                  </Text>
                </View>
              )}
              <View style={s.statChip}>
                <Icon name="group-line" size={12} color={colors.primary} />
                <Text style={[s.statText, { color: colors.primary }]}>
                  {coach.swimmers_count}
                </Text>
              </View>
              {coach.at_risk_count > 0 && (
                <View style={[s.statChip, { backgroundColor: colors.orangeDim }]}>
                  <Icon name="error-warning-fill" size={12} color={colors.orange} />
                  <Text style={[s.statText, { color: colors.orange }]}>
                    {coach.at_risk_count}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Icon name="arrow-right-s-line" size={20} color={colors.textDim} />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ── Coach Detail Bottom Sheet ────────────────────────────────────────
const CoachDetailSheet: React.FC<{
  visible: boolean;
  coach: CoachPerformanceSummary | null;
  onClose: () => void;
}> = ({ visible, coach, onClose }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 1 : 0,
      duration: ANIMATION.duration.normal,
      easing: visible ? ANIMATION.easing.enter : ANIMATION.easing.exit,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  if (!visible || !coach) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight * 0.6, 0],
  });

  const overlayOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const attendancePct = Math.round(coach.avg_attendance);
  const rankStyle = RANK_COLORS[coach.rank] ?? DEFAULT_RANK;

  return (
    <Animated.View style={[s.sheetOverlay, { opacity: overlayOpacity }]}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1 }} />
      </TouchableWithoutFeedback>
      <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}>
        <View style={s.sheetHandle} />

        {/* Coach header */}
        <View style={s.sheetHeader}>
          <View style={[s.sheetAvatar, { backgroundColor: rankStyle.bg }]}>
            <Text style={[s.sheetAvatarText, { color: rankStyle.text }]}>
              #{coach.rank}
            </Text>
          </View>
          <View style={s.sheetHeaderInfo}>
            <Text style={s.sheetName}>{coach.coach_name}</Text>
            <Text style={s.sheetSubtitle}>
              {coach.groups_count} groups · {coach.swimmers_count} swimmers
            </Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={s.sheetStatsGrid}>
          <View style={s.sheetStatItem}>
            <Text style={[s.sheetStatValue, { color: colors.swimmer }]}>
              {attendancePct}%
            </Text>
            <Text style={s.sheetStatLabel}>Attendance</Text>
          </View>
          <View style={s.sheetStatDivider} />
          <View style={s.sheetStatItem}>
            <Text style={[s.sheetStatValue, { color: colors.warning }]}>
              {coach.avg_rating !== null ? coach.avg_rating.toFixed(1) : '—'}
            </Text>
            <Text style={s.sheetStatLabel}>Avg Rating</Text>
          </View>
          <View style={s.sheetStatDivider} />
          <View style={s.sheetStatItem}>
            <Text style={[s.sheetStatValue, { color: colors.primary }]}>
              {coach.sessions_30d}
            </Text>
            <Text style={s.sheetStatLabel}>Sessions (30d)</Text>
          </View>
        </View>

        {/* Attendance bar */}
        <View style={s.sheetBarSection}>
          <Text style={s.sheetBarLabel}>Attendance Rate</Text>
          <View style={s.sheetBarTrack}>
            <View
              style={[
                s.sheetBarFill,
                {
                  width: `${Math.min(attendancePct, 100)}%`,
                  backgroundColor:
                    attendancePct >= 70
                      ? colors.swimmer
                      : attendancePct >= 50
                        ? colors.orange
                        : colors.error,
                },
              ]}
            />
          </View>
        </View>

        {/* At-risk section */}
        {coach.at_risk_count > 0 && (
          <View style={s.sheetAtRisk}>
            <View style={s.sheetAtRiskIcon}>
              <Icon name="error-warning-fill" size={20} color={colors.orange} />
            </View>
            <View style={s.sheetAtRiskInfo}>
              <Text style={s.sheetAtRiskTitle}>
                {coach.at_risk_count} at-risk swimmers
              </Text>
              <Text style={s.sheetAtRiskHint}>
                Low attendance or inactivity detected
              </Text>
            </View>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

// ── Main Screen ──────────────────────────────────────────────────────
export const ManagerCoachesScreen: React.FC = () => {
  const [coaches, setCoaches] = useState<CoachPerformanceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCoach, setSelectedCoach] =
    useState<CoachPerformanceSummary | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const headerEntry = useAnimatedEntry(0);

  const hasDataRef = useRef(false);

  const fetchCoaches = useCallback(async (isRefresh = false) => {
    if (!hasDataRef.current && !isRefresh) setIsLoading(true);
    try {
      const data = await managerService.getCoachPerformance();
      setCoaches(data);
      setError(null);
      hasDataRef.current = true;
    } catch {
      if (!hasDataRef.current) {
        setError('Failed to load coach performance.');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCoaches();
      // eslint-disable-next-line -- run on focus only
    }, []),
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCoaches(true);
  }, [fetchCoaches]);

  const handleCoachPress = useCallback((coach: CoachPerformanceSummary) => {
    setSelectedCoach(coach);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  if (isLoading && coaches.length === 0) {
    return <Loader message="Loading coaches..." />;
  }

  if (error && coaches.length === 0) {
    return <ErrorView message={error} onRetry={() => fetchCoaches()} />;
  }

  // Summary stats
  const avgAttendance =
    coaches.length > 0
      ? Math.round(
          coaches.reduce((sum, c) => sum + c.avg_attendance, 0) /
            coaches.length,
        )
      : 0;
  const totalAtRisk = coaches.reduce((sum, c) => sum + c.at_risk_count, 0);

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <View style={s.container}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Page title */}
          <Animated.View style={[s.pageHeader, headerEntry]}>
            <Text style={s.pageTitle}>Coaches</Text>
            <Text style={s.pageSubtitle}>Performance ranking</Text>
          </Animated.View>

          {/* Summary strip */}
          <View style={s.summaryStrip}>
            <View style={s.summaryItem}>
              <Text style={[s.summaryValue, { color: colors.primary }]}>
                {coaches.length}
              </Text>
              <Text style={s.summaryLabel}>Coaches</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              <Text style={[s.summaryValue, { color: colors.swimmer }]}>
                {avgAttendance}%
              </Text>
              <Text style={s.summaryLabel}>Avg Attendance</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              <Text
                style={[
                  s.summaryValue,
                  { color: totalAtRisk > 0 ? colors.orange : colors.swimmer },
                ]}
              >
                {totalAtRisk}
              </Text>
              <Text style={s.summaryLabel}>At Risk</Text>
            </View>
          </View>

          {/* Coach list */}
          {coaches.length === 0 ? (
            <View style={s.emptyContainer}>
              <Icon name="group-line" size={48} color={colors.textDim} />
              <Text style={s.emptyText}>No coaches found</Text>
            </View>
          ) : (
            <View style={s.listContainer}>
              {coaches.map((coach, index) => (
                <CoachPerformanceCard
                  key={coach.coach_id}
                  coach={coach}
                  index={index}
                  onPress={() => handleCoachPress(coach)}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {/* Detail bottom sheet */}
        <CoachDetailSheet
          visible={sheetVisible}
          coach={selectedCoach}
          onClose={handleCloseSheet}
        />
      </View>
    </SafeAreaView>
  );
};

// ── Styles ──────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },

  /* Page header */
  pageHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  pageSubtitle: {
    ...typography.body,
    color: colors.textMuted,
  },

  /* Summary strip */
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.card,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: fontFamily.headingBold,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
  },

  /* Coach card */
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  rankText: {
    fontSize: 14,
    fontFamily: fontFamily.headingBold,
  },
  coachInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  coachName: {
    fontSize: 16,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  coachStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  statText: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
  },

  /* List */
  listContainer: {
    gap: 0,
  },

  /* Empty */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },

  /* ── Sheet ── */
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.modal,
    borderTopRightRadius: borderRadius.modal,
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
    ...shadows.lg,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },

  /* Sheet header */
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sheetAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetAvatarText: {
    fontSize: 18,
    fontFamily: fontFamily.headingBold,
  },
  sheetHeaderInfo: {
    flex: 1,
  },
  sheetName: {
    fontSize: 20,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  sheetSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  /* Sheet stats grid */
  sheetStatsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  sheetStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  sheetStatValue: {
    fontSize: 22,
    fontFamily: fontFamily.headingBold,
  },
  sheetStatLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  sheetStatDivider: {
    width: 1,
    backgroundColor: colors.border,
  },

  /* Attendance bar */
  sheetBarSection: {
    marginBottom: spacing.md,
  },
  sheetBarLabel: {
    ...typography.caption,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  sheetBarTrack: {
    height: 12,
    backgroundColor: colors.surfaceLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  sheetBarFill: {
    height: '100%',
    borderRadius: 6,
  },

  /* At-risk section */
  sheetAtRisk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.orangeDim,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
  },
  sheetAtRiskIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetAtRiskInfo: {
    flex: 1,
  },
  sheetAtRiskTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.orange,
  },
  sheetAtRiskHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
