import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { styles } from './styles';

interface CircularProgressProps {
  /** Progress value 0–100 */
  percent: number;
  /** Outer diameter in px */
  size: number;
  /** Ring thickness in px */
  strokeWidth: number;
  /** Progress arc color */
  progressColor: string;
  /** Background track color */
  trackColor: string;
  /** Optional content rendered in the center */
  children?: React.ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percent,
  size,
  strokeWidth,
  progressColor,
  trackColor,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(percent, 0), 100);
  const strokeDashoffset = circumference * (1 - clamped / 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        style={styles.svg}
      >
        {/* Track ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>

      {/* Center content */}
      {children && (
        <View style={styles.center}>
          {children}
        </View>
      )}
    </View>
  );
};
