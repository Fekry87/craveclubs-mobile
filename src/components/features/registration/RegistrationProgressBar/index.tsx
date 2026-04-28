import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, Easing, LayoutChangeEvent } from 'react-native';
import { styles } from './styles';

interface RegistrationProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const RegistrationProgressBar: React.FC<RegistrationProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  useEffect(() => {
    if (containerWidth === 0) return;

    const targetWidth = (currentStep / totalSteps) * containerWidth;

    Animated.timing(animatedWidth, {
      toValue: targetWidth,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [currentStep, totalSteps, containerWidth, animatedWidth]);

  return (
    <View style={styles.container}>
      <View style={styles.track} onLayout={onLayout}>
        {containerWidth > 0 && (
          <Animated.View style={[styles.fill, { width: animatedWidth }]} />
        )}
      </View>
    </View>
  );
};
