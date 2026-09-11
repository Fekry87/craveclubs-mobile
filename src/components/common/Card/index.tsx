import React from 'react';
import { TouchableOpacity, View, StyleProp, ViewStyle, Animated } from 'react-native';
import { useAnimatedPress } from '../../../hooks/useAnimatedPress';
import { styles } from './styles';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** @deprecated No longer renders — kept for API compat */
  accentColor?: string;
  /** @deprecated No longer renders — kept for API compat */
  glowColor?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Card: React.FC<CardProps> = ({ children, onPress, style }) => {
  const { animatedStyle, onPressIn, onPressOut } = useAnimatedPress();

  if (onPress) {
    return (
      <AnimatedTouchable
        style={[styles.card, animatedStyle, style]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <View style={styles.cardInner}>{children}</View>
      </AnimatedTouchable>
    );
  }

  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardInner}>{children}</View>
    </View>
  );
};
