import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  Animated,
} from 'react-native';
import { styles, getButtonColors, ButtonVariant } from './styles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const colorSet = getButtonColors(variant);

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      speed: 40,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      speed: 30,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedTouchable
      style={[
        styles.base,
        { backgroundColor: colorSet.bg, transform: [{ scale }] },
        colorSet.border ? [styles.bordered, { borderColor: colorSet.border }] : null,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || loading}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading && (
        <ActivityIndicator color={colorSet.text} size="small" style={styles.loader} />
      )}
      <Text style={[styles.text, { color: colorSet.text }]}>{title}</Text>
    </AnimatedTouchable>
  );
};
