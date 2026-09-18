import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Icon } from '../../../common/Icon';
import { MeasurementProgressInterface } from '../../../../types/models.types';
import { formatShortDate, formatSwimTime } from '../../../../utils/formatters';
import { ANIMATION } from '../../../../theme/animations';
import { colors } from '../../../../theme';
import {
  styles,
  BAR_MAX,
  BAR_MIN,
  WEEK_LABEL_SPACE,
  COLUMN_WIDTH,
  COLUMN_GAP,
} from './styles';

interface MeasurementProgressChartProps {
  progress: MeasurementProgressInterface;
}

interface WeekPoint {
  start: string;
  /** Average pace per 50m across the week's measurements of the stroke. */
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
 * The swimmer's progress, one stroke at a time: a bar per training week, its
 * height the week's average **pace per 50m** with the axis inverted —
 * dropping times climb. Normalizing to a 50m pace lets a 100m swim sit next
 * to a 50m one. The stroke chips scroll; the opening stroke is the one swum
 * most in the latest week. When the weeks fit the card the row is spread
 * with no scrolling at all; only more weeks than fit scroll, starting at the
 * latest. A dashed line marks the average across the stroke's weeks, its
 * label on the left so it never covers the latest bar.
 */
export const MeasurementProgressChart: React.FC<MeasurementProgressChartProps> = ({
  progress,
}) => {
  const [strokeId, setStrokeId] = useState<number | null>(null);
  const [areaWidth, setAreaWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const chipsRef = useRef<ScrollView>(null);
  const chipX = useRef<Record<number, number>>({});

  // The chosen chip must be on screen when the card appears — the opening
  // stroke can be fourth in the row.
  useEffect(() => {
    if (strokeId === null) return;
    const x = chipX.current[strokeId];
    if (x !== undefined) chipsRef.current?.scrollTo({ x: Math.max(0, x - 12), animated: false });
  }, [strokeId]);

  // Pick (or re-pick, if the chosen stroke vanished) the opening stroke:
  // the one swum most in the latest week.
  useEffect(() => {
    const ids = progress.strokes.map((stroke) => stroke.id);
    if (ids.length === 0 || (strokeId !== null && ids.includes(strokeId))) return;
    const latestWeek = progress.weeks[progress.weeks.length - 1];
    let pick = ids[0];
    let best = -1;
    latestWeek?.entries.forEach((entry) => {
      if (entry.count > best && ids.includes(entry.stroke_id)) {
        best = entry.count;
        pick = entry.stroke_id;
      }
    });
    setStrokeId(pick);
  }, [progress, strokeId]);

  const points = useMemo<WeekPoint[]>(() => {
    if (strokeId === null) return [];
    return progress.weeks
      .map((week) => {
        const entry = week.entries.find((item) => item.stroke_id === strokeId);
        return entry
          ? { start: week.start, pace: entry.avg_pace, count: entry.count }
          : null;
      })
      .filter((point): point is WeekPoint => point !== null);
  }, [progress.weeks, strokeId]);

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

  if (strokeId === null || points.length === 0) return null;

  // Fewer weeks than fit → a plain spread row, nothing to scroll or hold.
  const contentWidth =
    points.length * COLUMN_WIDTH + (points.length - 1) * COLUMN_GAP;
  const overflows = areaWidth > 0 && contentWidth > areaWidth;

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

      {/* Stroke chips: a scrolling row, one always chosen. */}
      <ScrollView
        ref={chipsRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {progress.strokes.map((stroke) => {
          const selected = stroke.id === strokeId;
          return (
            <TouchableOpacity
              key={stroke.id}
              onLayout={(event) => {
                chipX.current[stroke.id] = event.nativeEvent.layout.x;
                if (stroke.id === strokeId) {
                  chipsRef.current?.scrollTo({
                    x: Math.max(0, event.nativeEvent.layout.x - 12),
                    animated: false,
                  });
                }
              }}
              onPress={() => setStrokeId(stroke.id)}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                styles.chip,
                selected && {
                  borderColor: colors.primary,
                  backgroundColor: colors.primaryDim,
                },
              ]}
            >
              <Text style={[styles.chipText, selected && { color: colors.primary }]}>
                {stroke.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View
        style={styles.chartArea}
        onLayout={(event) => setAreaWidth(event.nativeEvent.layout.width)}
      >
        {/* The average across this stroke's weeks; label on the left. */}
        <View
          style={[
            styles.averageLine,
            { bottom: WEEK_LABEL_SPACE + heightFor(average, minPace, maxPace) },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.averageText}>avg {formatSwimTime(average)}</Text>
          <View style={styles.averageDash} />
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          scrollEnabled={overflows}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.barsRow, !overflows && styles.barsRowSpread]}
          onContentSizeChange={(width) => {
            if (width > areaWidth) scrollRef.current?.scrollToEnd({ animated: false });
          }}
        >
          {points.map((point, index) => (
            <WeekBar
              key={`${strokeId}-${point.start}`}
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
    </View>
  );
};
