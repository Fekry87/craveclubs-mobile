import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Icon } from '../../../common/Icon';
import { StarRating } from '../StarRating';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface SwimmerRosterItemProps {
  swimmerId: number;
  name: string;
  level: string | null;
  isPresent: boolean;
  rating: number;
  onToggleAttendance: (swimmerId: number) => void;
  onRate: (swimmerId: number, rating: number) => void;
}

export const SwimmerRosterItem: React.FC<SwimmerRosterItemProps> = React.memo(({
  swimmerId,
  name,
  level,
  isPresent,
  rating,
  onToggleAttendance,
  onRate,
}) => {
  const handleToggle = () => {
    onToggleAttendance(swimmerId);
  };

  const handleRate = (newRating: number) => {
    onRate(swimmerId, newRating);
  };

  return (
    <View style={styles.container}>
      {/* Left: Name + Level */}
      <View style={styles.nameSection}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {level && (
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{level}</Text>
          </View>
        )}
      </View>

      {/* Center: Attendance toggle */}
      <Pressable
        style={[
          styles.toggleBtn,
          {
            backgroundColor: isPresent ? colors.swimmer : colors.error,
          },
        ]}
        onPress={handleToggle}
      >
        <Icon
          name={isPresent ? 'checkbox-circle-fill' : 'close-circle-fill'}
          size={20}
          color={colors.white}
        />
      </Pressable>

      {/* Right: Star rating */}
      <View style={styles.ratingSection}>
        <StarRating size={16} rating={rating} onRate={handleRate} />
      </View>
    </View>
  );
});
