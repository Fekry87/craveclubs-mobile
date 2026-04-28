import React from 'react';
import { View, Pressable } from 'react-native';
import { Icon } from '../../../common/Icon';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

const STAR_COUNT = 5;

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRate,
  size = 20,
  readonly = false,
}) => {
  const stars = Array.from({ length: STAR_COUNT }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {stars.map((starValue) => {
        const isFilled = starValue <= rating;
        const iconName = isFilled ? 'star-fill' : 'star-line';
        const iconColor = isFilled ? colors.warning : colors.textDim;

        if (readonly) {
          return (
            <View key={starValue} style={styles.star}>
              <Icon name={iconName} size={size} color={iconColor} />
            </View>
          );
        }

        return (
          <Pressable
            key={starValue}
            style={styles.star}
            onPress={() => onRate?.(starValue)}
          >
            <Icon name={iconName} size={size} color={iconColor} />
          </Pressable>
        );
      })}
    </View>
  );
};
