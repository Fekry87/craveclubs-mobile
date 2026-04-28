import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../../common/Card';
import { MonthlyRatingInterface } from '../../../../types/models.types';
import { ANIMATION, gradients } from '../../../../theme';
import { styles } from './styles';

interface ProgressChartProps {
  title: string;
  data: MonthlyRatingInterface[];
}

const AnimatedBar: React.FC<{ rating: number; maxHeight: number; index: number }> = ({
  rating,
  maxHeight,
  index,
}) => {
  const height = useRef(new Animated.Value(0)).current;
  const targetHeight = Math.max((rating / 5) * maxHeight, 4);

  useEffect(() => {
    Animated.timing(height, {
      toValue: targetHeight,
      duration: ANIMATION.duration.slow,
      delay: index * 100,
      easing: ANIMATION.easing.enter,
      useNativeDriver: false,
    }).start();
  }, [height, targetHeight, index]);

  return (
    <Animated.View style={[styles.barWrapper, { height }]}>
      <LinearGradient
        colors={[...gradients.bar]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.barGradient}
      />
    </Animated.View>
  );
};

export const ProgressChart: React.FC<ProgressChartProps> = ({
  title,
  data,
}) => {
  const maxHeight = 100;

  const getMonthLabel = (monthStr: string): string => {
    const [, month] = monthStr.split('-');
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return months[parseInt(month, 10) - 1] || month;
  };

  const recentData = data.slice(-6);

  return (
    <Card>
      <Text style={styles.title}>{title}</Text>
      {recentData.length === 0 ? (
        <Text style={styles.emptyText}>No rating data yet</Text>
      ) : (
        <View style={styles.chartContainer}>
          {recentData.map((item, index) => (
            <View key={item.month} style={styles.barContainer}>
              <Text style={styles.barValue}>
                {item.avg_rating.toFixed(1)}
              </Text>
              <AnimatedBar
                rating={item.avg_rating}
                maxHeight={maxHeight}
                index={index}
              />
              <Text style={styles.barLabel}>
                {getMonthLabel(item.month)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
};
