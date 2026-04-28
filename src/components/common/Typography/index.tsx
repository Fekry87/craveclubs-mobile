import React from 'react';
import { Text, TextStyle } from 'react-native';
import { styles } from './styles';

interface TypographyProps {
  variant?: 'hero' | 'heading' | 'subheading' | 'body' | 'bodyMedium' | 'caption' | 'label';
  children: React.ReactNode;
  style?: TextStyle;
  numberOfLines?: number;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  children,
  style,
  numberOfLines,
}) => {
  return (
    <Text style={[styles[variant], style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
};
