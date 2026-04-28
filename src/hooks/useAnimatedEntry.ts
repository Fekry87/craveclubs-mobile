import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { ANIMATION } from '../theme';

export const useAnimatedEntry = (index: number = 0) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(ANIMATION.enterOffset)).current;

  const cappedIndex = Math.min(index, 10);

  useEffect(() => {
    const delay = cappedIndex * ANIMATION.duration.stagger;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION.duration.normal,
        delay,
        easing: ANIMATION.easing.enter,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIMATION.duration.normal,
        delay,
        easing: ANIMATION.easing.enter,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cappedIndex, opacity, translateY]);

  return {
    opacity,
    transform: [{ translateY }],
  };
};
