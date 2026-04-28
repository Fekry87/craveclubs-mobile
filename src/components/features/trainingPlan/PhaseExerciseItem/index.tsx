import React from 'react';
import { View, Text } from 'react-native';
import { PhaseExerciseInterface } from '../../../../types/models.types';
import { styles } from './styles';

interface PhaseExerciseItemProps {
  exercise: PhaseExerciseInterface;
  index: number;
  isLast: boolean;
}

export const PhaseExerciseItem: React.FC<PhaseExerciseItemProps> = ({
  exercise,
  index,
  isLast,
}) => {
  const repsBadge = `${exercise.sets} x ${exercise.reps}`;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.numberCircle}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{exercise.name}</Text>
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
