import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Animated,
  DimensionValue,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorView } from '../../components/common/ErrorView';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { weeklyReportService } from '../../api/services/weeklyReport.service';
import { storageService } from '../../services/storage.service';
import { WeeklyReport } from '../../types/weeklyReport';
import { colors, spacing, fontFamily, borderRadius } from '../../theme';

/* ═══════════════════════════════════════════════════
   ISO Week Helpers
   ═══════════════════════════════════════════════════ */

function getCurrentISOWeek(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function parseWeek(week: string): { year: number; weekNum: number } {
  const [yearStr, wStr] = week.split('-W');
  return { year: parseInt(yearStr, 10), weekNum: parseInt(wStr, 10) };
}

function getISOWeeksInYear(year: number): number {
  const dec28 = new Date(Date.UTC(year, 11, 28));
  const dayNum = dec28.getUTCDay() || 7;
  dec28.setUTCDate(dec28.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dec28.getUTCFullYear(), 0, 1));
  return Math.ceil(((dec28.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getPrevWeek(week: string): string {
  const { year, weekNum } = parseWeek(week);
  if (weekNum <= 1) {
    const prevYear = year - 1;
    const maxWeek = getISOWeeksInYear(prevYear);
    return `${prevYear}-W${String(maxWeek).padStart(2, '0')}`;
  }
  return `${year}-W${String(weekNum - 1).padStart(2, '0')}`;
}

function getNextWeek(week: string): string {
  const { year, weekNum } = parseWeek(week);
  const maxWeek = getISOWeeksInYear(year);
  if (weekNum >= maxWeek) {
    return `${year + 1}-W01`;
  }
  return `${year}-W${String(weekNum + 1).padStart(2, '0')}`;
}

/* ── English day & month names ── */

const DAY_NAMES: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

const MONTH_NAMES: Record<number, string> = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sep',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec',
};

function formatWeekLabel(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart);
  const end = new Date(weekEnd);
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = MONTH_NAMES[start.getMonth()] ?? '';
  const endMonth = MONTH_NAMES[end.getMonth()] ?? '';
  const year = end.getFullYear();
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}

function formatSessionDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()] ?? '';
  return `${month} ${day}`;
}

function getDayName(dateStr: string): string {
  const d = new Date(dateStr);
  return DAY_NAMES[d.getDay()] ?? '';
}

/* ═══════════════════════════════════════════════════
   Cache Helpers (AsyncStorage-based)
   ═══════════════════════════════════════════════════ */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  timestamp: number;
  report: WeeklyReport;
}

async function getCachedReport(week: string): Promise<WeeklyReport | null> {
  try {
    const raw = await storageService.get(`weekly_report_${week}`);
    if (!raw) return null;
    const cached: CachedData = JSON.parse(raw);
    const currentWeek = getCurrentISOWeek();
    if (week !== currentWeek) return cached.report;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.report;
    return null;
  } catch {
    return null;
  }
}

async function setCachedReport(week: string, report: WeeklyReport): Promise<void> {
  try {
    const cached: CachedData = { timestamp: Date.now(), report };
    await storageService.set(`weekly_report_${week}`, JSON.stringify(cached));
  } catch {
    // Caching failures are non-critical
  }
}

/* ═══════════════════════════════════════════════════
   Skeleton Shimmer Component
   ═══════════════════════════════════════════════════ */

const SkeletonPulse: React.FC<{
  width: DimensionValue;
  height: number;
  borderRadiusVal?: number;
  style?: object;
}> = ({ width, height, borderRadiusVal = borderRadius.sm, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: borderRadiusVal,
          backgroundColor: colors.surfaceLight,
          opacity,
        },
        style,
      ]}
    />
  );
};

/* ═══════════════════════════════════════════════════
   Stars Component
   ═══════════════════════════════════════════════════ */

const Stars: React.FC<{ rating: number; size?: number }> = ({
  rating,
  size = 14,
}) => (
  <View style={s.starsRow}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Icon
        key={i}
        name={i < rating ? 'star-fill' : 'star-line'}
        size={size}
        color={i < rating ? colors.warning : colors.borderLight}
      />
    ))}
  </View>
);

/* ═══════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════ */

const LoadingSkeleton: React.FC = () => (
  <View style={s.content}>
    <View style={s.summaryRow}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={s.summaryCardFlex}>
          <Card>
            <View style={s.skeletonCardContent}>
              <SkeletonPulse width={36} height={36} borderRadiusVal={18} />
              <SkeletonPulse width={50} height={24} style={{ marginTop: spacing.sm }} />
              <SkeletonPulse width={60} height={12} style={{ marginTop: spacing.xs }} />
            </View>
          </Card>
        </View>
      ))}
    </View>
    {[1, 2, 3].map((i) => (
      <View key={i} style={{ marginBottom: spacing.sm }}>
        <Card>
          <View style={s.skeletonSessionContent}>
            <SkeletonPulse width={'80%'} height={16} />
            <SkeletonPulse width={'50%'} height={14} style={{ marginTop: spacing.sm }} />
          </View>
        </Card>
      </View>
    ))}
  </View>
);

/* ═══════════════════════════════════════════════════
   Weekly Report Screen
   ═══════════════════════════════════════════════════ */

export const WeeklyReportScreen: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(getCurrentISOWeek);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const summaryEntry = useAnimatedEntry(0);
  const sessionsEntry = useAnimatedEntry(1);
  const planEntry = useAnimatedEntry(2);

  const fetchReport = useCallback(
    async (week: string, forceRefresh = false) => {
      try {
        setError(null);
        if (!forceRefresh) {
          setIsLoading(true);
        }

        if (!forceRefresh) {
          const cached = await getCachedReport(week);
          if (cached) {
            setReport(cached);
            setIsLoading(false);
            setRefreshing(false);
            return;
          }
        }

        const data = await weeklyReportService.getWeeklyReport(week);
        setReport(data);
        await setCachedReport(week, data);
      } catch {
        setError('Something went wrong. Tap to retry.');
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      fetchReport(currentWeek);
      // eslint-disable-next-line -- fetchReport is stable, only re-run on week change
    }, [currentWeek]),
  );

  const handlePrevWeek = useCallback(() => {
    const prev = getPrevWeek(currentWeek);
    setCurrentWeek(prev);
    setReport(null);
  }, [currentWeek]);

  const handleNextWeek = useCallback(() => {
    const next = getNextWeek(currentWeek);
    setCurrentWeek(next);
    setReport(null);
  }, [currentWeek]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReport(currentWeek, true);
  }, [fetchReport, currentWeek]);

  const isCurrentWeek = currentWeek === getCurrentISOWeek();

  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return colors.swimmer;
    if (rate >= 50) return colors.warning;
    return colors.error;
  };

  const getRatingColor = (rating: number | null) => {
    if (rating === null) return colors.textDim;
    if (rating >= 4) return colors.swimmer;
    if (rating >= 2.5) return colors.warning;
    return colors.error;
  };

  if (error && !report) {
    return (
      <View style={s.flex}>
        <WeekNav
          weekLabel={currentWeek}
          onPrev={handlePrevWeek}
          onNext={handleNextWeek}
          nextDisabled={isCurrentWeek}
        />
        <ErrorView message={error} onRetry={() => fetchReport(currentWeek)} />
      </View>
    );
  }

  return (
    <View style={s.flex}>
      {/* Week Navigation */}
      <WeekNav
        weekLabel={
          report
            ? formatWeekLabel(report.week_start, report.week_end)
            : currentWeek
        }
        onPrev={handlePrevWeek}
        onNext={handleNextWeek}
        nextDisabled={isCurrentWeek}
      />

      {isLoading ? (
        <LoadingSkeleton />
      ) : !report || report.sessions_scheduled === 0 ? (
        <EmptyState
          icon="calendar-event-line"
          title="No sessions this week"
          message="Try checking the previous week"
        />
      ) : (
        <ScrollView
          style={s.container}
          contentContainerStyle={s.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* ═══ 1. Summary Cards Row ═══ */}
          <Animated.View style={[s.summaryRow, summaryEntry]}>
            {/* Attendance */}
            <View style={s.summaryCardFlex}>
              <Card>
                <View style={s.summaryCardContent}>
                  <View
                    style={[
                      s.summaryIconCircle,
                      {
                        backgroundColor: `${getAttendanceColor(report.attendance_rate)}18`,
                      },
                    ]}
                  >
                    <Icon
                      name="checkbox-circle-fill"
                      size={18}
                      color={getAttendanceColor(report.attendance_rate)}
                    />
                  </View>
                  <Text
                    style={[
                      s.summaryValue,
                      { color: getAttendanceColor(report.attendance_rate) },
                    ]}
                  >
                    {report.sessions_attended}/{report.sessions_scheduled}
                  </Text>
                  <Text style={s.summaryLabel}>Sessions</Text>
                </View>
              </Card>
            </View>

            {/* Avg Rating */}
            <View style={s.summaryCardFlex}>
              <Card>
                <View style={s.summaryCardContent}>
                  <View
                    style={[
                      s.summaryIconCircle,
                      {
                        backgroundColor: `${getRatingColor(report.avg_rating)}18`,
                      },
                    ]}
                  >
                    <Icon
                      name="star-fill"
                      size={18}
                      color={getRatingColor(report.avg_rating)}
                    />
                  </View>
                  <Text
                    style={[
                      s.summaryValue,
                      { color: getRatingColor(report.avg_rating) },
                    ]}
                  >
                    {report.avg_rating !== null
                      ? report.avg_rating.toFixed(1)
                      : '—'}
                  </Text>
                  {report.avg_rating !== null && (
                    <Stars rating={Math.round(report.avg_rating)} size={10} />
                  )}
                  <Text style={s.summaryLabel}>Avg Rating</Text>
                </View>
              </Card>
            </View>

            {/* Streak / Status */}
            <View style={s.summaryCardFlex}>
              <Card>
                <View style={s.summaryCardContent}>
                  <View
                    style={[
                      s.summaryIconCircle,
                      {
                        backgroundColor:
                          report.sessions_missed === 0
                            ? `${colors.swimmer}18`
                            : `${colors.error}18`,
                      },
                    ]}
                  >
                    <Icon
                      name={
                        report.sessions_missed === 0
                          ? 'fire-fill'
                          : 'close-circle-fill'
                      }
                      size={18}
                      color={
                        report.sessions_missed === 0
                          ? colors.swimmer
                          : colors.error
                      }
                    />
                  </View>
                  <Text
                    style={[
                      s.summaryValue,
                      {
                        color:
                          report.sessions_missed === 0
                            ? colors.swimmer
                            : colors.error,
                      },
                    ]}
                  >
                    {report.sessions_missed === 0
                      ? report.sessions_attended.toString()
                      : report.sessions_missed.toString()}
                  </Text>
                  <Text style={s.summaryLabel}>
                    {report.sessions_missed === 0
                      ? 'Perfect'
                      : 'Missed'}
                  </Text>
                </View>
              </Card>
            </View>
          </Animated.View>

          {/* ═══ 2. Session Cards List ═══ */}
          <Animated.View style={sessionsEntry}>
            <Text style={s.sectionTitle}>Session Details</Text>
            {[...report.evaluations]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((evaluation) => (
                <Card
                  key={evaluation.session_id}
                  style={s.sessionCard}
                >
                  {/* Header row: day + date */}
                  <View style={s.sessionHeaderRow}>
                    <View style={s.sessionDayDateRow}>
                      <Text style={s.sessionDayName}>
                        {getDayName(evaluation.date)}
                      </Text>
                      <View style={s.sessionDateBadge}>
                        <Text style={s.sessionDateText}>
                          {formatSessionDate(evaluation.date)}
                        </Text>
                      </View>
                    </View>
                    {/* Attendance pill */}
                    <View
                      style={[
                        s.attendancePill,
                        {
                          backgroundColor: evaluation.present
                            ? colors.successDim
                            : colors.errorDim,
                        },
                      ]}
                    >
                      <View
                        style={[
                          s.attendanceDot,
                          {
                            backgroundColor: evaluation.present
                              ? colors.swimmer
                              : colors.error,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          s.attendanceLabel,
                          {
                            color: evaluation.present
                              ? colors.swimmer
                              : colors.error,
                          },
                        ]}
                      >
                        {evaluation.present ? 'Present' : 'Absent'}
                      </Text>
                    </View>
                  </View>

                  {/* Session title */}
                  {evaluation.session_title ? (
                    <Text style={s.sessionTitle} numberOfLines={1}>
                      {evaluation.session_title}
                    </Text>
                  ) : null}

                  {/* Rating row */}
                  {evaluation.present && evaluation.rating !== null && (
                    <View style={s.ratingRow}>
                      <Stars rating={evaluation.rating} size={16} />
                      <Text style={s.ratingValue}>
                        {evaluation.rating}.0
                      </Text>
                    </View>
                  )}

                  {/* Coach notes */}
                  {evaluation.coach_notes && (
                    <Text style={s.coachNotes}>
                      &ldquo;{evaluation.coach_notes}&rdquo;
                    </Text>
                  )}
                </Card>
              ))}
          </Animated.View>

          {/* ═══ 3. Current Plan Phase ═══ */}
          {report.current_plan_phase && (
            <Animated.View style={planEntry}>
              <Card style={s.planCard}>
                <View style={s.planHeader}>
                  <View style={s.planIconCircle}>
                    <Icon
                      name="clipboard-fill"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={s.planTitle}>Current Training Plan</Text>
                </View>
                <Text style={s.planName}>
                  {report.current_plan_phase.plan_name}
                </Text>
                <View style={s.planPhaseRow}>
                  <Text style={s.planPhaseText}>
                    Phase {report.current_plan_phase.phase_number} —{' '}
                    {report.current_plan_phase.focus}
                  </Text>
                </View>
                <Text style={s.planWeekRange}>
                  Week {report.current_plan_phase.week_start} to{' '}
                  {report.current_plan_phase.week_end}
                </Text>
              </Card>
            </Animated.View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

/* ═══════════════════════════════════════════════════
   Week Navigation Bar
   ═══════════════════════════════════════════════════ */

const WeekNav: React.FC<{
  weekLabel: string;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled: boolean;
}> = ({ weekLabel, onPrev, onNext, nextDisabled }) => (
  <View style={s.weekNav}>
    <TouchableOpacity
      onPress={onPrev}
      style={s.weekNavBtn}
      activeOpacity={0.6}
    >
      <Icon name="arrow-left-s-line" size={24} color={colors.primary} />
    </TouchableOpacity>

    <Text style={s.weekNavLabel}>{weekLabel}</Text>

    <TouchableOpacity
      onPress={onNext}
      style={[s.weekNavBtn, nextDisabled && s.weekNavBtnDisabled]}
      activeOpacity={nextDisabled ? 1 : 0.6}
      disabled={nextDisabled}
    >
      <Icon
        name="arrow-right-s-line"
        size={24}
        color={nextDisabled ? colors.textDim : colors.primary}
      />
    </TouchableOpacity>
  </View>
);

/* ═══════════════════════════════════════════════════
   Styles
   ═══════════════════════════════════════════════════ */

const s = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },

  /* ── Week Navigation ── */
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  weekNavBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekNavBtnDisabled: {
    backgroundColor: colors.surfaceLight,
    opacity: 0.5,
  },
  weekNavLabel: {
    fontSize: 15,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },

  /* ── Summary Cards ── */
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryCardFlex: {
    flex: 1,
  },
  summaryCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    minHeight: 100,
  },
  summaryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: fontFamily.headingBold,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },

  /* ── Stars ── */
  starsRow: {
    flexDirection: 'row',
    gap: 1,
  },

  /* ── Section Title ── */
  sectionTitle: {
    fontSize: 18,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    marginBottom: spacing.md,
  },

  /* ── Session Cards ── */
  sessionCard: {
    marginBottom: spacing.sm,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sessionDayDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sessionDayName: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  sessionDateBadge: {
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  sessionDateText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyMedium,
    color: colors.primary,
  },
  sessionTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  attendancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  attendanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  attendanceLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  ratingValue: {
    fontSize: 14,
    fontFamily: fontFamily.headingBold,
    color: colors.warning,
  },
  coachNotes: {
    fontSize: 13,
    fontFamily: fontFamily.bodyRegular,
    fontStyle: 'italic',
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: spacing.xs,
  },

  /* ── Plan Phase ── */
  planCard: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  planIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  planName: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  planPhaseRow: {
    marginBottom: spacing.xs,
  },
  planPhaseText: {
    fontSize: 14,
    fontFamily: fontFamily.bodyMedium,
    color: colors.text,
  },
  planWeekRange: {
    fontSize: 13,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },

  /* ── Skeleton ── */
  skeletonCardContent: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skeletonSessionContent: {
    paddingVertical: spacing.sm,
  },
});
