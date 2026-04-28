import React, { useRef, useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, Animated, View } from 'react-native';
import { colors } from '../../../theme';
import { styles, BUTTON_COLORS } from './styles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'blue';
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
  const [pressed, setPressed] = useState(false);

  const colorSet = BUTTON_COLORS[variant];

  const onPressIn = () => {
    setPressed(true);
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    setPressed(false);
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const loaderColor = variant === 'secondary' ? colors.text : colors.white;

  return (
    <AnimatedTouchable
      style={[
        { transform: [{ scale }] },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      <View
        style={[
          styles.base,
          {
            backgroundColor: colorSet.bg,
            borderColor: colorSet.border,
            borderBottomWidth: pressed ? 2 : 4,
            marginTop: pressed ? 2 : 0,
          },
          variant === 'secondary' && styles.secondaryBorder,
        ]}
      >
        {loading && (
          <ActivityIndicator color={loaderColor} size="small" style={styles.loader} />
        )}
        <Text style={[styles.text, { color: colorSet.text }]}>{title}</Text>
      </View>
    </AnimatedTouchable>
  );
};
