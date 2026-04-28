import React from 'react';
import { View, Text } from 'react-native';
import { TrainingPlanItemInterface } from '../../../../types/models.types';
import { styles } from './styles';

interface ExerciseItemProps {
  exercise: TrainingPlanItemInterface;
  index: number;
  isLast: boolean;
}

export const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  index,
  isLast,
}) => {
  const label = exercise.drill
    ? `${exercise.stroke} — ${exercise.drill}`
    : exercise.stroke;

  const distanceLabel =
    typeof exercise.distance === 'string'
      ? exercise.distance
      : `${exercise.distance}m`;
  const repsBadge = `${exercise.reps} x ${distanceLabel}`;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.numberCircle}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{label}</Text>
          {exercise.notes ? (
            <Text style={styles.notes} numberOfLines={2}>
              {exercise.notes}
            </Text>
          ) : null}
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{repsBadge}</Text>
        </View>
      </View>
      {!isLast && <View style={styles.divider} />}
    </>
  );
};
