import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { colors } from '../../../theme';
import { styles } from './styles';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.iconContainer}>
        <Icon name="error-warning-line" size={36} color={colors.error} />
      </View>
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <View style={{ alignSelf: 'stretch' }}>
          <Button title="Try again" onPress={onRetry} />
        </View>
      )}
    </Animated.View>
  );
};
