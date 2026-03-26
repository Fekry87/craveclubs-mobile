import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/common/Card';
import { Icon, IconName } from '../../components/common/Icon';
import { Loader } from '../../components/common/Loader';
import { ErrorView } from '../../components/common/ErrorView';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { managerService } from '../../api/services/manager.service';
import { ClubAnalytics } from '../../types/analytics.types';
import {
  colors,
  spacing,
  fontFamily,
  borderRadius,
  shadows,
  typography,
} from '../../theme';

// ── KPI Card ─────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  label: string;
  value: string | number;
  icon: IconName;
  color: string;
  dimColor: string;
  index: number;
}> = ({ label, value, icon, color, dimColor, index }) => {
  const entry = useAnimatedEntry(index);
  return (
    <Animated.View style={[s.kpiCard, entry]}>
      <View style={[s.kpiIconCircle, { backgroundColor: dimColor }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <Text style={[s.kpiValue, { color }]}>{value}</Text>
      <Text style={s.kpiLabel}>{label}</Text>
    </Animated.View>
  );
};

// ── Bar Chart Row ────────────────────────────────────────────────────
const MembershipBar: React.FC<{
  month: string;
  value: number;
  maxValue: number;
  index: number;
}> = ({ month, value, maxValue, index }) => {
  const entry = useAnimatedEntry(Math.min(index + 3, 10));
  const widthPct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const shortMonth = month.length > 3 ? month.substring(0, 3) : month;

  return (
    <Animated.View style={[s.barRow, entry]}>
      <Text style={s.barLabel}>{shortMonth}</Text>
      <View style={s.barTrack}>
        <View
          style={[
            s.barFill,
            { width: `${Math.max(widthPct, 3)}%` },
          ]}
        />
      </View>
      <Text style={s.barValue}>{value}</Text>
    </Animated.View>
  );
};

// ── Attendance Dot ────────────────────────────────────────────────────
const AttendanceDot: React.FC<{
  rate: number;
  week: string;
  maxRate: number;
}> = ({ rate, week, maxRate }) => {
  const height = maxRate > 0 ? (rate / maxRate) * 60 + 8 : 8;
  const shortWeek = week.length > 4 ? week.substring(week.length - 4) : week;

  return (
    <View style={s.dotCol}>
      <View style={s.dotBarWrap}>
        <View style={[s.dotBar, { height }]} />
      </View>
      <Text style={s.dotLabel}>{shortWeek}</Text>
      <Text style={s.dotRate}>{Math.round(rate)}%</Text>
    </View>
  );
};

// ── Main Screen ──────────────────────────────────────────────────────
export const ManagerAnalyticsScreen: React.FC = () => {
  const [analytics, setAnalytics] = useState<ClubAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const sectionEntry1 = useAnimatedEntry(0);
  const sectionEntry2 = useAnimatedEntry(2);
  const sectionEntry3 = useAnimatedEntry(4);
  const sectionEntry4 = useAnimatedEntry(5);

  const fetchAnalytics = useCallback(async (force = false) => {
    if (!force) setIsLoading(true);
    setError(null);
    try {
      const data = await managerService.getAnalytics(force);
      setAnalytics(data);
    } catch {
      setError('Failed to load analytics.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics();
      // eslint-disable-next-line -- run on focus only
    }, []),
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnalytics(true);
  }, [fetchAnalytics]);

  if (isLoading && !analytics) {
    return <Loader message="Loading analytics..." />;
  }

  if (error && !analytics) {
    return <ErrorView message={error} onRetry={() => fetchAnalytics(true)} />;
  }

  if (!analytics) {
    return <Loader message="Loading analytics..." />;
  }

  const { retention, membership_growth, attendance_trend, registration_funnel } =
    analytics;

  // Compute max for bars
  const maxMembership = Math.max(
    ...membership_growth.map((m) => m.total),
    1,
  );
  const maxAttendanceRate = Math.max(
    ...attendance_trend.map((w) => w.rate),
    1,
  );

  // Attendance trend direction
  const lastTwo = attendance_trend.slice(-2);
  const trendUp =
    lastTwo.length === 2 ? lastTwo[1].rate >= lastTwo[0].rate : true;

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <ScrollView
        style={s.scrollView}
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
        {/* ── Page Title ── */}
        <Animated.View style={sectionEntry1}>
          <Text style={s.pageTitle}>Analytics</Text>
          <Text style={s.pageSubtitle}>Club performance overview</Text>
        </Animated.View>

        {/* ── KPI Cards Strip ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.kpiStrip}
        >
          <KpiCard
            label="Total Members"
            value={
              membership_growth.length > 0
                ? membership_growth[membership_growth.length - 1].total
                : 0
            }
            icon="group-fill"
            color={colors.primary}
            dimColor={colors.primaryDim}
            index={0}
          />
          <KpiCard
            label="Retention"
            value={`${Math.round(retention.retention_rate_30d)}%`}
            icon="shield-user-fill"
            color={colors.swimmer}
            dimColor={colors.swimmerDim}
            index={1}
          />
          <KpiCard
            label="At Risk"
            value={retention.at_risk_count}
            icon="error-warning-fill"
            color={colors.orange}
            dimColor={colors.orangeDim}
            index={2}
          />
          <KpiCard
            label="Pending"
            value={registration_funnel.pending_now}
            icon="time-fill"
            color={colors.secondary}
            dimColor={colors.secondaryDim}
            index={3}
          />
        </ScrollView>

        {/* ── Membership Growth ── */}
        <Animated.View style={sectionEntry2}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIconCircle, { backgroundColor: colors.primaryDim }]}>
              <Icon name="bar-chart-box-fill" size={16} color={colors.primary} />
            </View>
            <Text style={s.sectionTitle}>Membership Growth</Text>
          </View>
          <Card style={s.sectionCard}>
            {membership_growth.length === 0 ? (
              <Text style={s.emptyText}>No membership data available</Text>
            ) : (
              membership_growth.slice(-6).map((m, i) => (
                <MembershipBar
                  key={m.month}
                  month={m.month}
                  value={m.total}
                  maxValue={maxMembership}
                  index={i}
                />
              ))
            )}
          </Card>
        </Animated.View>

        {/* ── Attendance Trend ── */}
        <Animated.View style={sectionEntry3}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIconCircle, { backgroundColor: colors.swimmerDim }]}>
              <Icon name="run-fill" size={16} color={colors.swimmer} />
            </View>
            <Text style={s.sectionTitle}>Attendance Trend</Text>
            <View
              style={[
                s.trendBadge,
                {
                  backgroundColor: trendUp
                    ? colors.successDim
                    : colors.errorDim,
                },
              ]}
            >
              <Icon
                name={trendUp ? 'arrow-up-line' : 'arrow-down-line'}
                size={14}
                color={trendUp ? colors.success : colors.error}
              />
              <Text
                style={[
                  s.trendText,
                  { color: trendUp ? colors.success : colors.error },
                ]}
              >
                {trendUp ? 'Improving' : 'Declining'}
              </Text>
            </View>
          </View>
          <Card style={s.sectionCard}>
            {attendance_trend.length === 0 ? (
              <Text style={s.emptyText}>No attendance data available</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.dotsRow}
              >
                {attendance_trend.slice(-8).map((w) => (
                  <AttendanceDot
                    key={w.week}
                    rate={w.rate}
                    week={w.week}
                    maxRate={maxAttendanceRate}
                  />
                ))}
              </ScrollView>
            )}
          </Card>
        </Animated.View>

        {/* ── At-Risk Swimmers ── */}
        {retention.at_risk_count > 0 && (
          <Animated.View style={sectionEntry4}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionIconCircle, { backgroundColor: colors.orangeDim }]}>
                <Icon name="error-warning-fill" size={16} color={colors.orange} />
              </View>
              <Text style={s.sectionTitle}>At-Risk Swimmers</Text>
            </View>
            <Card style={s.sectionCard}>
              <View style={s.atRiskContent}>
                <View style={s.atRiskIconCircle}>
                  <Icon name="error-warning-fill" size={32} color={colors.orange} />
                </View>
                <Text style={s.atRiskCount}>{retention.at_risk_count}</Text>
                <Text style={s.atRiskLabel}>
                  swimmers need attention
                </Text>
                <Text style={s.atRiskHint}>
                  Avg attendance: {Math.round(retention.avg_attendance_rate)}%
                </Text>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* ── Registration Funnel ── */}
        <Animated.View style={sectionEntry4}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIconCircle, { backgroundColor: colors.secondaryDim }]}>
              <Icon name="user-add-fill" size={16} color={colors.secondary} />
            </View>
            <Text style={s.sectionTitle}>Registration (30 days)</Text>
          </View>
          <Card style={s.sectionCard}>
            <View style={s.funnelRow}>
              <FunnelItem
                label="Submitted"
                value={registration_funnel.submitted_30d}
                color={colors.primary}
              />
              <FunnelItem
                label="Approved"
                value={registration_funnel.approved_30d}
                color={colors.swimmer}
              />
              <FunnelItem
                label="Rejected"
                value={registration_funnel.rejected_30d}
                color={colors.error}
              />
              <FunnelItem
                label="Pending"
                value={registration_funnel.pending_now}
                color={colors.orange}
              />
            </View>
            <View style={s.approvalRow}>
              <Text style={s.approvalText}>
                Approval rate: {Math.round(registration_funnel.approval_rate)}%
              </Text>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Funnel Item ────────────────────────────────────────────────────
const FunnelItem: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => (
  <View style={s.funnelItem}>
    <Text style={[s.funnelValue, { color }]}>{value}</Text>
    <Text style={s.funnelLabel}>{label}</Text>
  </View>
);

// ── Styles ──────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },

  /* Page header */
  pageTitle: {
    fontSize: 28,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  pageSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },

  /* KPI strip */
  kpiStrip: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  kpiCard: {
    width: 130,
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.sm,
  },
  kpiIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 24,
    fontFamily: fontFamily.headingBold,
  },
  kpiLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },

  /* Section headers */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  sectionCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },

  /* Trend badge */
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  trendText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
  },

  /* Bar chart */
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  barLabel: {
    width: 32,
    ...typography.caption,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  barTrack: {
    flex: 1,
    height: 20,
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  barValue: {
    width: 36,
    textAlign: 'right',
    ...typography.caption,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },

  /* Attendance dots */
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  dotCol: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dotBarWrap: {
    height: 68,
    justifyContent: 'flex-end',
  },
  dotBar: {
    width: 28,
    backgroundColor: colors.swimmer,
    borderRadius: 6,
    minHeight: 8,
  },
  dotLabel: {
    fontSize: 10,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },
  dotRate: {
    fontSize: 10,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.swimmer,
  },

  /* At-risk */
  atRiskContent: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  atRiskIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.orangeDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  atRiskCount: {
    fontSize: 32,
    fontFamily: fontFamily.headingBold,
    color: colors.orange,
  },
  atRiskLabel: {
    ...typography.body,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  atRiskHint: {
    ...typography.caption,
    color: colors.textMuted,
  },

  /* Registration funnel */
  funnelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  funnelItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  funnelValue: {
    fontSize: 20,
    fontFamily: fontFamily.headingBold,
  },
  funnelLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  approvalRow: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
  },
  approvalText: {
    ...typography.caption,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.swimmer,
  },

  /* Empty */
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
