import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from '../../components/common/Icon';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorView } from '../../components/common/ErrorView';
import { PlanPhaseCard } from '../../components/features/trainingPlan/PlanPhaseCard';
import { ExerciseItem } from '../../components/features/trainingPlan/ExerciseItem';
import { useTrainingPlanStore } from '../../store/trainingPlan.store';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { TrainingPlanPhaseData } from '../../types/models.types';
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  fontFamily,
} from '../../theme';

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  beginner: { bg: colors.successDim, text: colors.success },
  intermediate: { bg: colors.orangeDim, text: colors.orange },
  advanced: { bg: colors.errorDim, text: colors.error },
};

export const MyPlanScreen: React.FC = () => {
  const { assignment, plan, phases, isLoading, error, fetchTrainingPlan } =
    useTrainingPlanStore();
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

  // Animations
  const headerEntry = useAnimatedEntry(0);
  const statsEntry = useAnimatedEntry(1);
  const goalsEntry = useAnimatedEntry(2);
  const phasesEntry = useAnimatedEntry(3);

  // Progress bar animation
  const progressAnim = useRef(new Animated.Value(0)).current;

  const markPlanViewed = useTrainingPlanStore((s) => s.markPlanViewed);

  useFocusEffect(
    useCallback(() => {
      fetchTrainingPlan();
      markPlanViewed();
      // eslint-disable-next-line -- run on focus only
    }, []),
  );

  // Animate progress bar when data loads
  useEffect(() => {
    if (assignment && plan) {
      const now = new Date();
      const start = new Date(assignment.start_date);
      const end = new Date(assignment.end_date);
      const total = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      const pct = total > 0 ? Math.min(Math.max(elapsed / total, 0), 1) : 0;

      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: pct,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [assignment, plan, progressAnim]);

  const handleTogglePhase = useCallback(
    (index: number) => {
      setExpandedPhase((prev) => (prev === index ? null : index));
    },
    [],
  );

  if (isLoading) return <Loader message="Loading training plan..." />;
  if (error) return <ErrorView message={error} onRetry={fetchTrainingPlan} />;
  if (!assignment || !plan) {
    return (
      <View style={s.safeArea}>
        <EmptyState
          icon="clipboard-line"
          title="No Training Plan"
          message="You don't have an active training plan yet. Your coach will assign one to you."
        />
      </View>
    );
  }

  const difficultyColor =
    DIFFICULTY_COLORS[plan.difficulty_level] ?? DIFFICULTY_COLORS.beginner;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Build phases: use backend phases if available, otherwise show as single phase
  const displayPhases: TrainingPlanPhaseData[] =
    phases.length > 0
      ? phases
      : plan.phases && plan.phases.length > 0
        ? plan.phases
        : plan.items.length > 0
          ? [
              {
                week_start: 1,
                week_end: plan.duration_weeks,
                focus: plan.title,
                exercises: plan.items.map((item) => ({
                  name: item.drill
                    ? `${item.stroke} — ${item.drill}`
                    : item.stroke,
                  sets: item.reps,
                  reps:
                    typeof item.distance === 'number'
                      ? item.distance
                      : parseInt(String(item.distance), 10) || 0,
                  notes: item.notes,
                })),
              },
            ]
          : [];

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={s.safeArea}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Paused Banner */}
        {assignment.status === 'paused' && (
          <View style={s.pausedBanner}>
            <Icon name="pause-circle-line" size={18} color={colors.warningDark} />
            <Text style={s.pausedText}>This plan is currently paused</Text>
          </View>
        )}

        {/* Plan Header Card */}
        <Animated.View style={headerEntry}>
          <View style={s.planCard}>
            <View style={s.planTitleRow}>
              <Text style={s.planTitle} numberOfLines={2}>
                {plan.title}
              </Text>
              <View
                style={[s.difficultyBadge, { backgroundColor: difficultyColor.bg }]}
              >
                <Text style={[s.difficultyText, { color: difficultyColor.text }]}>
                  {plan.difficulty_level}
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={s.statsRow}>
              <View style={s.stat}>
                <Icon name="time-line" size={16} color={colors.textMuted} />
                <Text style={s.statText}>
                  {plan.duration_weeks} weeks
                </Text>
              </View>
              <View style={s.stat}>
                <Icon name="calendar-event-line" size={16} color={colors.textMuted} />
                <Text style={s.statText}>
                  {plan.sessions_per_week}x / week
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={s.progressContainer}>
              <View style={s.progressTrack}>
                <Animated.View
                  style={[s.progressFill, { width: progressWidth }]}
                />
              </View>
              <View style={s.progressLabels}>
                <Text style={s.progressDate}>
                  {formatDate(assignment.start_date)}
                </Text>
                <Text style={s.progressDate}>
                  {formatDate(assignment.end_date)}
                </Text>
              </View>
            </View>

            {/* Coach Notes */}
            {assignment.coach_notes ? (
              <View style={s.notesRow}>
                <Icon name="chat-1-line" size={16} color={colors.textMuted} />
                <Text style={s.notesText} numberOfLines={3}>
                  {assignment.coach_notes}
                </Text>
              </View>
            ) : null}
          </View>
        </Animated.View>

        {/* Goals Section */}
        {plan.goals ? (
          <Animated.View style={goalsEntry}>
            <Text style={s.sectionLabel}>Goals</Text>
            <View style={s.goalsCard}>
              <Text style={s.goalsText}>{plan.goals}</Text>
            </View>
          </Animated.View>
        ) : null}

        {/* Phases Section */}
        {displayPhases.length > 0 && (
          <Animated.View style={phasesEntry}>
            <Text style={s.sectionLabel}>Phases</Text>
            {displayPhases.map((phase, idx) => (
              <PlanPhaseCard
                key={`phase-${idx}`}
                phase={phase}
                index={idx}
                isExpanded={expandedPhase === idx}
                onToggle={() => handleTogglePhase(idx)}
              />
            ))}
          </Animated.View>
        )}

        {/* Items Flat List (if no phases but has items) */}
        {displayPhases.length === 0 && plan.items.length > 0 && (
          <Animated.View style={statsEntry}>
            <Text style={s.sectionLabel}>Exercises</Text>
            <View style={s.exercisesCard}>
              {plan.items.map((item, idx) => (
                <ExerciseItem
                  key={item.id}
                  exercise={item}
                  index={idx}
                  isLast={idx === plan.items.length - 1}
                />
              ))}
            </View>
          </Animated.View>
        )}

        <View style={s.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },

  // Paused Banner
  pausedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningDim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  pausedText: {
    ...typography.caption,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.warningDark,
  },

  // Plan Card
  planCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    ...shadows.card,
    marginBottom: spacing.md,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm + 4,
  },
  planTitle: {
    ...typography.subheading,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  difficultyText: {
    ...typography.caption,
    fontFamily: fontFamily.bodySemiBold,
    textTransform: 'capitalize',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    ...typography.caption,
    color: colors.textMuted,
  },

  // Progress
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressDate: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },

  // Coach Notes
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  notesText: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 18,
  },

  // Section
  sectionLabel: {
    ...typography.bodyMedium,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },

  // Goals
  goalsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  goalsText: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 20,
  },

  // Exercises flat list
  exercisesCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    ...shadows.card,
  },

  bottomSpacer: {
    height: spacing.xl,
  },
});
