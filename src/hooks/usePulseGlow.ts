import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export const usePulseGlow = (active: boolean = true) => {
  const opacity = useRef(new Animated.Value(active ? 0.5 : 1)).current;

  useEffect(() => {
    if (active) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.5,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      opacity.setValue(1);
    }
  }, [active, opacity]);

  return { opacity };
};
