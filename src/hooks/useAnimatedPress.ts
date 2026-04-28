import { useRef } from 'react';
import { Animated } from 'react-native';

export const useAnimatedPress = () => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale }],
  };

  return { animatedStyle, onPressIn, onPressOut };
};
