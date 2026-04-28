import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Icon, IconName } from '../Icon';
import { colors } from '../../../theme';
import { styles } from './styles';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox-line',
  title,
  message,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, iconScale]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: iconScale }] }]}>
        <Icon name={icon} size={48} color={colors.textMuted} />
      </Animated.View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </Animated.View>
  );
};
