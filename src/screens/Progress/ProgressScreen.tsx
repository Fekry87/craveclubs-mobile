import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  RefreshControl,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { ErrorView } from '../../components/common/ErrorView';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icon';
import { StatCard } from '../../components/features/progress/StatCard';
import { DailyRatingsChart } from '../../components/features/progress/DailyRatingsChart';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { progressService } from '../../api/services/progress.service';
import { StatsResponseType, PaginatedResponseType } from '../../types/api.types';
import { EvaluationInterface } from '../../types/models.types';
import { ProgressStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/auth.store';
import { formatPercentage, formatRating } from '../../utils/formatters';
import { colors, spacing, fontFamily } from '../../theme';

type ProgressNavProp = NativeStackNavigationProp<ProgressStackParamList, 'ProgressMain'>;

export const ProgressScreen: React.FC = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<ProgressNavProp>();
  const [stats, setStats] = useState<StatsResponseType | null>(null);
  const [evaluations, setEvaluations] =
    useState<PaginatedResponseType<EvaluationInterface> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const hasEvaluations = user?.features?.evaluations_enabled ?? false;

  const chartEntry = useAnimatedEntry(3);
  const evalsEntry = useAnimatedEntry(4);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [statsData, evalData] = await Promise.all([
        progressService.getStats(),
        hasEvaluations
          ? progressService.getEvaluations(1, 100)
          : Promise.resolve(null),
      ]);
      setStats(statsData);
      if (evalData) setEvaluations(evalData);
    } catch {
      setError('Failed to load progress data.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [hasEvaluations]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      // eslint-disable-next-line -- run on focus only, fetchData deps are stable
    }, []),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const navigateToEvaluations = useCallback(() => {
    navigation.navigate('Evaluations');
  }, [navigation]);

  if (isLoading) return <Loader message="Loading progress..." />;
  if (error) return <ErrorView message={error} onRetry={fetchData} />;
  if (!stats) return <EmptyState icon="bar-chart-box-line" title="No data available" />;

  // Show only latest 2 evaluations, sorted by date (newest first)
  const latestEvals = evaluations?.data.slice(0, 2) ?? [];

  return (
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
      <View style={screenStyles.statsRow}>
        <StatCard
          icon="bar-chart-box-line"
          value={formatPercentage(stats.attendance_rate)}
          label="Attendance"
          color="primary"
          index={0}
        />
        <StatCard
          icon="star-fill"
          value={formatRating(stats.average_rating)}
          label="Avg Rating"
          color="warning"
          index={1}
        />
      </View>

      <View style={screenStyles.statsRow}>
        <StatCard
          icon="drop-fill"
          value={stats.total_sessions.toString()}
          label="Total Sessions"
          color="swimmer"
          index={2}
        />
        <StatCard
          icon="award-fill"
          value={(stats.best_rating ?? 0).toString()}
          label="Best Rating"
          color="success"
          index={3}
        />
      </View>

      <Animated.View style={chartEntry}>
        <DailyRatingsChart evaluations={evaluations?.data ?? []} />
      </Animated.View>

      {hasEvaluations && latestEvals.length > 0 && (
        <Animated.View style={[screenStyles.section, evalsEntry]}>
          <View style={screenStyles.sectionHeader}>
            <Text style={screenStyles.sectionTitle}>Latest Evaluations</Text>
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
          {latestEvals.map((evaluation) => {
            const emptyStars = 5 - evaluation.rating;
            const evalDate = new Date(evaluation.session.date);
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
                    <Icon name="star-fill" size={20} color={colors.warning} />
                  </View>
                  <View style={screenStyles.evalContent}>
                    <View style={screenStyles.evalStarsRow}>
                      {Array.from({ length: evaluation.rating }).map((_, i) => (
                        <Icon
                          key={`f-${i}`}
                          name="star-fill"
                          size={14}
                          color={colors.warning}
                        />
                      ))}
                      {Array.from({ length: emptyStars }).map((_, i) => (
                        <Icon
                          key={`e-${i}`}
                          name="star-line"
                          size={14}
                          color={colors.borderLight}
                        />
                      ))}
                      <Text style={screenStyles.evalRatingText}>
                        {evaluation.rating}.0
                      </Text>
                    </View>
                    <Text style={screenStyles.evalGroupName}>
                      {evaluation.session.group.name}
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
          })}
        </Animated.View>
      )}
    </ScrollView>
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  section: {
    marginTop: spacing.lg,
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

  /* ═══ Evaluation cards ═══ */
  evalCard: {
    marginBottom: spacing.sm,
  },
  evalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  evalStarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.warningDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  evalContent: {
    flex: 1,
  },
  evalStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 2,
  },
  evalRatingText: {
    fontSize: 13,
    fontFamily: fontFamily.headingBold,
    color: colors.warning,
    marginLeft: 4,
  },
  evalGroupName: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  evalNotes: {
    fontSize: 12,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  evalDate: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },
});
