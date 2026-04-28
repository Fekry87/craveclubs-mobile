import React from 'react';
import { View, Text, Animated, StyleProp, ViewStyle } from 'react-native';
import { Card } from '../../../common/Card';
import { Icon, IconName } from '../../../common/Icon';
import { useAnimatedEntry } from '../../../../hooks/useAnimatedEntry';
import { colors } from '../../../../theme';
import { styles } from './styles';

type AccentColor = 'primary' | 'warning' | 'success' | 'swimmer';

const COLOR_MAP: Record<AccentColor, { accent: string; dim: string }> = {
  primary: { accent: colors.primary, dim: colors.primaryDim },
  warning: { accent: colors.warning, dim: colors.warningDim },
  success: { accent: colors.success, dim: colors.successDim },
  swimmer: { accent: colors.swimmer, dim: colors.swimmerDim },
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
  const { accent, dim } = COLOR_MAP[color];

  return (
    <Animated.View style={[{ flex: 1 }, entryStyle, style]}>
      <Card glowColor={accent}>
        <View style={styles.content}>
          <View style={[styles.iconBox, { backgroundColor: dim }]}>
            <Icon name={icon} size={24} color={accent} />
          </View>
          <Text style={[styles.value, { color: accent }]}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </Card>
    </Animated.View>
  );
});
