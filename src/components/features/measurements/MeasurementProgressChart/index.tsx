import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { Icon } from '../../../common/Icon';
import { ChoiceChipGroup } from '../../registration/ChoiceChip';
import { MeasurementProgressInterface } from '../../../../types/models.types';
import { formatShortDate, formatSwimTime } from '../../../../utils/formatters';
import { ANIMATION } from '../../../../theme/animations';
import { colors } from '../../../../theme';
import { styles, BAR_MAX, BAR_MIN, WEEK_LABEL_SPACE } from './styles';

interface MeasurementProgressChartProps {
  progress: MeasurementProgressInterface;
}

const ALL = 'all';

interface WeekPoint {
  start: string;
  /** Average pace per 50m across the week's (filtered) measurements. */
  pace: number;
  count: number;
}

/** Faster (lower pace) draws taller: min..max pace maps to BAR_MAX..BAR_MIN. */
const heightFor = (pace: number, min: number, max: number): number =>
  max - min < 0.005
    ? BAR_MAX * 0.7
    : BAR_MIN + ((max - pace) / (max - min)) * (BAR_MAX - BAR_MIN);

/** One week's bar, growing in on mount (built-in Animated, like ProgressChart). */
const WeekBar: React.FC<{ point: WeekPoint; height: number; isLatest: boolean }> = ({
  point,
  height,
  isLatest,
}) => {
  const grow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(grow, {
      toValue: 1,
      duration: ANIMATION.duration.slow,
      useNativeDriver: false,
    }).start();
  }, [grow]);

  return (
    <View style={styles.column}>
      <Text style={[styles.barValue, isLatest && { color: colors.primary }]}>
        {formatSwimTime(point.pace)}
      </Text>
      <Animated.View
        style={[
          styles.bar,
          {
            height: grow.interpolate({ inputRange: [0, 1], outputRange: [BAR_MIN / 2, height] }),
            backgroundColor: isLatest ? colors.primary : colors.primaryDim,
          },
        ]}
      />
      <Text style={styles.weekLabel}>{formatShortDate(`${point.start}T00:00:00`)}</Text>
    </View>
  );
};

/**
 * The swimmer's progress: one bar per training week, its height the week's
 * average **pace per 50m** with the axis inverted — dropping times climb.
 * Normalizing to a 50m pace is what lets a 100m swim sit next to a 50m one
 * (and the All view exist at all). A chip row filters by stroke; a dashed
 * line marks the average across the visible weeks.
 */
export const MeasurementProgressChart: React.FC<MeasurementProgressChartProps> = ({
  progress,
}) => {
  const [strokeFilter, setStrokeFilter] = useState<string>(ALL);
  const scrollRef = useRef<ScrollView>(null);

  const chipOptions = useMemo(
    () => [
      { value: ALL, label: 'All' },
      ...progress.strokes.map((stroke) => ({ value: String(stroke.id), label: stroke.name })),
    ],
    [progress.strokes],
  );

  const points = useMemo<WeekPoint[]>(
    () =>
      progress.weeks
        .map((week) => {
          const entries =
            strokeFilter === ALL
              ? week.entries
              : week.entries.filter((entry) => String(entry.stroke_id) === strokeFilter);
          const count = entries.reduce((sum, entry) => sum + entry.count, 0);
          if (count === 0) return null;
          const pace =
            entries.reduce((sum, entry) => sum + entry.avg_pace * entry.count, 0) / count;
          return { start: week.start, pace, count };
        })
        .filter((point): point is WeekPoint => point !== null),
    [progress.weeks, strokeFilter],
  );

  const { minPace, maxPace, average, totalCount } = useMemo(() => {
    const paces = points.map((point) => point.pace);
    const count = points.reduce((sum, point) => sum + point.count, 0);
    const sum = points.reduce((total, point) => total + point.pace * point.count, 0);
    return {
      minPace: Math.min(...paces),
      maxPace: Math.max(...paces),
      average: count > 0 ? sum / count : 0,
      totalCount: count,
    };
  }, [points]);

  // The verdict: latest week against the one before it.
  const trend = useMemo(() => {
    if (points.length < 2) return null;
    const latest = points[points.length - 1].pace;
    const previous = points[points.length - 2].pace;
    if (previous <= 0) return null;
    const percent = ((previous - latest) / previous) * 100;
    if (Math.abs(percent) < 0.05) return { label: 'Steady', color: colors.textMuted, icon: null };
    return percent > 0
      ? {
          label: `${percent.toFixed(1)}% faster`,
          color: colors.swimmer,
          icon: 'arrow-up-s-line' as const,
        }
      : {
          label: `${Math.abs(percent).toFixed(1)}% slower`,
          color: colors.warningDark,
          icon: 'arrow-down-s-line' as const,
        };
  }, [points]);

  if (points.length === 0 && strokeFilter === ALL) return null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Progress</Text>
        {trend && (
          <View style={[styles.trendPill, { backgroundColor: `${trend.color}1F` }]}>
            {trend.icon && <Icon name={trend.icon} size={14} color={trend.color} />}
            <Text style={[styles.trendText, { color: trend.color }]}>{trend.label}</Text>
          </View>
        )}
      </View>
      <Text style={styles.subtitle}>Average pace per 50m — taller is faster</Text>

      <ChoiceChipGroup options={chipOptions} value={strokeFilter} onChange={setStrokeFilter} />

      {points.length === 0 ? (
        <Text style={styles.emptyText}>No times for this swim type yet.</Text>
      ) : (
        <>
          <View style={styles.chartArea}>
            {/* The average across the visible weeks. */}
            <View
              style={[
                styles.averageLine,
                { bottom: WEEK_LABEL_SPACE + heightFor(average, minPace, maxPace) },
              ]}
              pointerEvents="none"
            >
              <View style={styles.averageDash} />
              <Text style={styles.averageText}>avg {formatSwimTime(average)}</Text>
            </View>

            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.barsRow}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            >
              {points.map((point, index) => (
                <WeekBar
                  key={`${strokeFilter}-${point.start}`}
                  point={point}
                  height={heightFor(point.pace, minPace, maxPace)}
                  isLatest={index === points.length - 1}
                />
              ))}
            </ScrollView>
          </View>

          <Text style={styles.footerText}>
            {totalCount} {totalCount === 1 ? 'swim' : 'swims'} across {points.length}{' '}
            {points.length === 1 ? 'week' : 'weeks'}
          </Text>
        </>
      )}
    </View>
  );
};
