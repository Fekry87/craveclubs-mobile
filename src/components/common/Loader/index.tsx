import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { colors } from '../../../theme';
import { styles } from './styles';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
};
