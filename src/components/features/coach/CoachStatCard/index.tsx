import React from 'react';
import { View, Text, Animated } from 'react-native';
import { Card } from '../../../common/Card';
import { Icon, IconName } from '../../../common/Icon';
import { useAnimatedEntry } from '../../../../hooks/useAnimatedEntry';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface CoachStatCardProps {
  icon: IconName;
  iconBg: string;
  value: string | number;
  label: string;
  index?: number;
}

export const CoachStatCard: React.FC<CoachStatCardProps> = React.memo(({
  icon,
  iconBg,
  value,
  label,
  index = 0,
}) => {
  const entryStyle = useAnimatedEntry(Math.min(index, 10));

  return (
    <Animated.View style={[styles.container, entryStyle]}>
      <Card>
        <View style={styles.content}>
          <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
            <Icon name={icon} size={20} color={colors.white} />
          </View>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Card>
    </Animated.View>
  );
});
