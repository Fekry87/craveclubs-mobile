import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { storageService } from '../../../services/storage.service';
import { colors } from '../../../theme';

const { width, height } = Dimensions.get('window');
const CONFETTI_COUNT = 20;
const CONFETTI_COLORS = [
  colors.primary, colors.swimmer, colors.warning, colors.orange,
  colors.secondary, colors.pink, colors.error, colors.teal,
];
const STORAGE_KEY = 'welcome_confetti_shown';

interface ConfettiDot {
  x: number;
  color: string;
  size: number;
  anim: Animated.Value;
  delay: number;
  rotation: number;
}

export const WelcomeConfetti: React.FC<{ trigger: boolean }> = ({
  trigger,
}) => {
  const [show, setShow] = useState(false);
  const dots = useRef<ConfettiDot[]>([]);

  useEffect(() => {
    if (!trigger) return;

    let cancelled = false;

    (async () => {
      const shown = await storageService.get(STORAGE_KEY);
      if (shown === 'true' || cancelled) return;

      await storageService.set(STORAGE_KEY, 'true');
      if (cancelled) return;

      // Initialize dots
      dots.current = Array.from({ length: CONFETTI_COUNT }, () => ({
        x: Math.random() * width,
        color:
          CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 6,
        anim: new Animated.Value(0),
        delay: Math.random() * 600,
        rotation: 360 + Math.random() * 360,
      }));

      setShow(true);

      // Animate all dots
      const animations = dots.current.map((dot) =>
        Animated.timing(dot.anim, {
          toValue: 1,
          duration: 1800 + Math.random() * 600,
          delay: dot.delay,
          useNativeDriver: true,
        }),
      );

      Animated.parallel(animations).start(() => {
        if (!cancelled) setShow(false);
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [trigger]);

  if (!show) return null;

  return (
    <View style={s.container} pointerEvents="none">
      {dots.current.map((dot, i) => {
        const translateY = dot.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, height + 40],
        });
        const opacity = dot.anim.interpolate({
          inputRange: [0, 0.1, 0.8, 1],
          outputRange: [0, 1, 1, 0],
        });
        const rotate = dot.anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${dot.rotation}deg`],
        });

        return (
          <Animated.View
            key={i}
            style={[
              s.dot,
              {
                left: dot.x,
                width: dot.size,
                height: dot.size,
                borderRadius: dot.size / 2,
                backgroundColor: dot.color,
                opacity,
                transform: [{ translateY }, { rotate }],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  dot: {
    position: 'absolute',
    top: 0,
  },
});
