import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Icon } from '../../../common/Icon';
import { PhaseExerciseItem } from '../PhaseExerciseItem';
import { TrainingPlanPhaseData } from '../../../../types/models.types';
import { colors, ANIMATION } from '../../../../theme';
import { useAnimatedEntry } from '../../../../hooks/useAnimatedEntry';
import { styles } from './styles';

interface PlanPhaseCardProps {
  phase: TrainingPlanPhaseData;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export const PlanPhaseCard: React.FC<PlanPhaseCardProps> = ({
  phase,
  index,
  isExpanded,
  onToggle,
}) => {
  const entryStyle = useAnimatedEntry(Math.min(index, 10));
  const expandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      easing: ANIMATION.easing.enter,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, expandAnim]);

  const chevronRotation = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const exerciseCount = phase.exercises?.length ?? 0;
  const phaseName = phase.focus || `Phase ${index + 1}`;

  return (
    <Animated.View style={entryStyle}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.header}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.chevron,
              { transform: [{ rotate: chevronRotation }] },
            ]}
          >
            <Icon name="arrow-down-s-line" size={20} color={colors.textMuted} />
          </Animated.View>

          <View style={styles.phaseCircle}>
            <Text style={styles.phaseNumber}>{index + 1}</Text>
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.phaseName} numberOfLines={1}>
              {phaseName}
            </Text>
            <Text style={styles.weekRange}>
              Weeks {phase.week_start}–{phase.week_end}
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
            </Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {phase.focus ? (
              <View style={styles.focusPill}>
                <Text style={styles.focusText}>{phase.focus}</Text>
              </View>
            ) : null}

            <View style={styles.exerciseList}>
              {(phase.exercises ?? []).map((exercise, exIndex) => (
                <PhaseExerciseItem
                  key={`ex-${exIndex}`}
                  exercise={exercise}
                  index={exIndex}
                  isLast={exIndex === exerciseCount - 1}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
};
