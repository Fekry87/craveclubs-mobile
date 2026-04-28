import React, { useState, useEffect } from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { Icon } from '../../../common/Icon';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface ElapsedTimerProps {
  startTime: string;
  style?: StyleProp<ViewStyle>;
}

const formatElapsed = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const getElapsedSeconds = (startTime: string): number => {
  const start = new Date(startTime).getTime();
  const now = Date.now();
  const diff = Math.max(0, Math.floor((now - start) / 1000));
  return diff;
};

export const ElapsedTimer: React.FC<ElapsedTimerProps> = ({
  startTime,
  style,
}) => {
  const [elapsed, setElapsed] = useState<number>(() =>
    getElapsedSeconds(startTime)
  );

  useEffect(() => {
    setElapsed(getElapsedSeconds(startTime));

    const interval = setInterval(() => {
      setElapsed(getElapsedSeconds(startTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <View style={[styles.container, style]}>
      <Icon name="timer-fill" size={24} color={colors.warning} />
      <Text style={styles.timerText}>{formatElapsed(elapsed)}</Text>
    </View>
  );
};
