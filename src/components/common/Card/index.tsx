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
  glowColor?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  glowColor,
}) => {
  const { animatedStyle, onPressIn, onPressOut } = useAnimatedPress();

  const glowShadow = glowColor
    ? {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 3,
      }
    : undefined;

  if (onPress) {
    return (
      <AnimatedTouchable
        style={[styles.card, glowShadow, animatedStyle, style]}
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
    <View style={[styles.card, glowShadow, style]}>
      <View style={styles.cardInner}>{children}</View>
    </View>
  );
};
