import React from 'react';
import { View, Text, Animated, StyleProp, ViewStyle } from 'react-native';
import { Card } from '../../../common/Card';
import { Icon, IconName } from '../../../common/Icon';
import { useAnimatedEntry } from '../../../../hooks/useAnimatedEntry';
import { colors } from '../../../../theme';
import { styles } from './styles';

type AccentColor = 'primary' | 'warning' | 'success' | 'swimmer';

// Resolved at render time so branded colors are picked up
const getColorSet = (color: AccentColor): { accent: string; dim: string } => {
  switch (color) {
    case 'warning':
      return { accent: colors.warningDark, dim: colors.warningDim };
    case 'success':
      return { accent: colors.success, dim: colors.successDim };
    case 'swimmer':
      return { accent: colors.swimmer, dim: colors.swimmerDim };
    default:
      return { accent: colors.primary, dim: colors.primaryDim };
  }
};

interface StatCardProps {
  icon: IconName;
  value: string;
  label: string;
  color?: AccentColor;
  index?: number;
  style?: StyleProp<ViewStyle>;
}

export const StatCard: React.FC<StatCardProps> = React.memo(({
  icon,
  value,
  label,
  color = 'primary',
  index = 0,
  style,
}) => {
  const entryStyle = useAnimatedEntry(Math.min(index, 10));
  const { accent, dim } = getColorSet(color);

  return (
    <Animated.View style={[{ flex: 1 }, entryStyle, style]}>
      <Card>
        <View style={styles.content}>
          <View style={[styles.iconBox, { backgroundColor: dim }]}>
            <Icon name={icon} size={18} color={accent} />
          </View>
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Card>
    </Animated.View>
  );
});
