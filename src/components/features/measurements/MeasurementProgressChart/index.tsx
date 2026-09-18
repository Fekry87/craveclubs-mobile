import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Line,
  Circle,
  Text as SvgText,
} from 'react-native-svg';
import { Icon } from '../../../common/Icon';
import {
  MeasurementPeriod,
  MeasurementProgressInterface,
} from '../../../../types/models.types';
import { formatShortDate, formatSwimTime } from '../../../../utils/formatters';
import { colors, fontFamily } from '../../../../theme';
import {
  styles,
  CHART_HEIGHT,
  PLOT_TOP,
  PLOT_BOTTOM,
  V_MARGIN,
  PAD_X,
  STEP_MIN,
} from './styles';

interface MeasurementProgressChartProps {
  progress: MeasurementProgressInterface;
  /** Dim the chart while a new period is loading. */
  loading?: boolean;
  onPeriodChange: (period: MeasurementPeriod) => void;
}

interface Point {
  start: string;
  /** Average pace per 50m in the bucket, of the chosen stroke. */
  pace: number;
  count: number;
}

const PERIODS: { key: MeasurementPeriod; label: string; noun: string }[] = [
  { key: 'day', label: 'Days', noun: 'day' },
  { key: 'week', label: 'Weeks', noun: 'week' },
  { key: 'month', label: 'Months', noun: 'month' },
];

const AREA_GRADIENT = 'measureProgressFill';

const labelFor = (start: string, period: MeasurementPeriod): string =>
  period === 'month'
    ? new Date(`${start}T00:00:00`).toLocaleDateString('en-US', { month: 'short' })
    : formatShortDate(`${start}T00:00:00`);

/**
 * The swimmer's progress, one stroke at a time: a line of pace-per-50m
 * averages, one point per bucket (day, week or month — the swimmer picks),
 * **with the pace axis inverted so improving times climb**. Normalizing to a
 * 50m pace lets a 100m swim sit next to a 50m one. The chart is an SVG area +
 * line with a dot per point; it scrolls horizontally when the points don't
 * fit and starts at the latest. A dashed line marks the average across the
 * visible points; a trend pill compares the last two.
 */
export const MeasurementProgressChart: React.FC<MeasurementProgressChartProps> = ({
  progress,
  loading = false,
  onPeriodChange,
}) => {
  const [strokeId, setStrokeId] = useState<number | null>(null);
  const [width, setWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const chipsRef = useRef<ScrollView>(null);
  const chipX = useRef<Record<number, number>>({});

  // Keep the chosen chip on screen (the opening stroke can be far along the row).
  useEffect(() => {
    if (strokeId === null) return;
    const x = chipX.current[strokeId];
    if (x !== undefined) chipsRef.current?.scrollTo({ x: Math.max(0, x - 12), animated: false });
  }, [strokeId]);

  // Pick (or re-pick, when the chosen stroke leaves the data) the opening
  // stroke: the one swum most in the latest bucket.
  useEffect(() => {
    const ids = progress.strokes.map((stroke) => stroke.id);
    if (ids.length === 0 || (strokeId !== null && ids.includes(strokeId))) return;
    const latest = progress.points[progress.points.length - 1];
    let pick = ids[0];
    let best = -1;
    latest?.entries.forEach((entry) => {
      if (entry.count > best && ids.includes(entry.stroke_id)) {
        best = entry.count;
        pick = entry.stroke_id;
      }
    });
    setStrokeId(pick);
  }, [progress, strokeId]);

  const points = useMemo<Point[]>(() => {
    if (strokeId === null) return [];
    return progress.points
      .map((point) => {
        const entry = point.entries.find((item) => item.stroke_id === strokeId);
        return entry
          ? { start: point.start, pace: entry.avg_pace, count: entry.count }
          : null;
      })
      .filter((point): point is Point => point !== null);
  }, [progress.points, strokeId]);

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

  const trend = useMemo(() => {
    if (points.length < 2) return null;
    const latest = points[points.length - 1].pace;
    const previous = points[points.length - 2].pace;
    if (previous <= 0) return null;
    const percent = ((previous - latest) / previous) * 100;
    if (Math.abs(percent) < 0.05) return { label: 'Steady', color: colors.textMuted, icon: null };
    return percent > 0
      ? { label: `${percent.toFixed(1)}% faster`, color: colors.swimmer, icon: 'arrow-up-s-line' as const }
      : { label: `${Math.abs(percent).toFixed(1)}% slower`, color: colors.warningDark, icon: 'arrow-down-s-line' as const };
  }, [points]);

  // Faster (lower pace) sits higher. A flat run keeps its dots off the edges.
  const mapPace = useMemo(() => {
    const innerTop = PLOT_TOP + V_MARGIN;
    const innerBottom = PLOT_BOTTOM - V_MARGIN;
    const range = maxPace - minPace;
    return (pace: number): number =>
      range < 0.005
        ? (innerTop + innerBottom) / 2
        : innerTop + ((pace - minPace) / range) * (innerBottom - innerTop);
  }, [minPace, maxPace]);

  const period = progress.period;
  const periodNoun = PERIODS.find((item) => item.key === period)?.noun ?? 'week';

  if (strokeId === null || points.length === 0) {
    return (
      <View style={styles.card}>
        <PeriodToggle period={period} onChange={onPeriodChange} />
        <Text style={styles.emptyText}>No times for this range yet.</Text>
      </View>
    );
  }

  // Spread the points to fill the card; only more than fit start scrolling.
  const n = points.length;
  const step = n === 1 ? 0 : Math.max(STEP_MIN, (width - 2 * PAD_X) / (n - 1));
  const chartWidth = n === 1 ? width : PAD_X * 2 + step * (n - 1);
  const overflows = chartWidth > width + 1;
  const xFor = (index: number): number =>
    n === 1 ? width / 2 : PAD_X + index * step;

  const coords = points.map((point, index) => ({
    x: xFor(index),
    y: mapPace(point.pace),
    point,
    isLatest: index === n - 1,
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');
  const areaPath =
    n > 1
      ? `${linePath} L ${coords[n - 1].x.toFixed(1)} ${PLOT_BOTTOM} L ${coords[0].x.toFixed(1)} ${PLOT_BOTTOM} Z`
      : '';
  const avgY = mapPace(average);
  const gridYs = [PLOT_TOP + V_MARGIN, (PLOT_TOP + PLOT_BOTTOM) / 2, PLOT_BOTTOM - V_MARGIN];

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
      <Text style={styles.subtitle}>Average pace per 50m — higher is faster</Text>

      <PeriodToggle period={period} onChange={onPeriodChange} />

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
                  chipsRef.current?.scrollTo({ x: Math.max(0, event.nativeEvent.layout.x - 12), animated: false });
                }
              }}
              onPress={() => setStrokeId(stroke.id)}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                styles.chip,
                selected && { borderColor: colors.primary, backgroundColor: colors.primaryDim },
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
        style={[styles.chartArea, loading && styles.chartLoading]}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      >
        {/* The average, pinned left so it stays put while the line scrolls under it. */}
        {width > 0 && (
          <View style={[styles.avgLabel, { top: avgY - 8 }]} pointerEvents="none">
            <Text style={styles.avgText}>avg {formatSwimTime(average)}</Text>
          </View>
        )}

        {width > 0 && (
          <ScrollView
            // Remount per range/stroke so a leftover scroll offset from a
            // longer series (e.g. Weeks) never leaves a shorter one (Months)
            // parked off-screen.
            key={`${period}-${strokeId}`}
            ref={scrollRef}
            horizontal
            scrollEnabled={overflows}
            showsHorizontalScrollIndicator={false}
            onContentSizeChange={() => {
              scrollRef.current?.scrollTo({ x: overflows ? chartWidth : 0, animated: false });
            }}
          >
            <Svg width={chartWidth} height={CHART_HEIGHT}>
              <Defs>
                <LinearGradient id={AREA_GRADIENT} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.primary} stopOpacity={0.22} />
                  <Stop offset="1" stopColor={colors.primary} stopOpacity={0.02} />
                </LinearGradient>
              </Defs>

              {/* Gridlines */}
              {gridYs.map((y) => (
                <Line
                  key={y}
                  x1={0}
                  x2={chartWidth}
                  y1={y}
                  y2={y}
                  stroke={colors.borderLight}
                  strokeWidth={1}
                />
              ))}

              {/* Average */}
              <Line
                x1={0}
                x2={chartWidth}
                y1={avgY}
                y2={avgY}
                stroke={colors.textDim}
                strokeWidth={1}
                strokeDasharray="4 4"
              />

              {areaPath !== '' && <Path d={areaPath} fill={`url(#${AREA_GRADIENT})`} />}
              {n > 1 && (
                <Path
                  d={linePath}
                  fill="none"
                  stroke={colors.primary}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}

              {coords.map((c) => (
                <React.Fragment key={c.point.start}>
                  <SvgText
                    x={c.x}
                    y={c.y - 12}
                    fill={c.isLatest ? colors.primary : colors.textMuted}
                    fontSize={11}
                    fontFamily={fontFamily.bodySemiBold}
                    textAnchor="middle"
                  >
                    {formatSwimTime(c.point.pace)}
                  </SvgText>
                  <Circle
                    cx={c.x}
                    cy={c.y}
                    r={4.5}
                    fill={c.isLatest ? colors.primary : colors.white}
                    stroke={colors.primary}
                    strokeWidth={2}
                  />
                  <SvgText
                    x={c.x}
                    y={PLOT_BOTTOM + 20}
                    fill={colors.textDim}
                    fontSize={11}
                    fontFamily={fontFamily.bodyMedium}
                    textAnchor="middle"
                  >
                    {labelFor(c.point.start, period)}
                  </SvgText>
                </React.Fragment>
              ))}
            </Svg>
          </ScrollView>
        )}
      </View>

      <Text style={styles.footerText}>
        {totalCount} {totalCount === 1 ? 'swim' : 'swims'} across {n}{' '}
        {n === 1 ? periodNoun : `${periodNoun}s`}
      </Text>
    </View>
  );
};

/** Day / Week / Month segmented control. */
const PeriodToggle: React.FC<{
  period: MeasurementPeriod;
  onChange: (period: MeasurementPeriod) => void;
}> = ({ period, onChange }) => (
  <View style={styles.toggle}>
    {PERIODS.map((item) => {
      const active = item.key === period;
      return (
        <TouchableOpacity
          key={item.key}
          style={[styles.toggleBtn, active && styles.toggleBtnActive]}
          onPress={() => onChange(item.key)}
          activeOpacity={0.8}
          accessibilityRole="tab"
          accessibilityState={{ selected: active }}
        >
          <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);
