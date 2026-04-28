import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  TouchableOpacity,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../../common/Card';
import { Icon } from '../../../common/Icon';
import { EvaluationInterface, DailyRatingType } from '../../../../types/models.types';
import {
  buildDailyRatings,
  groupIntoWeeks,
  getInitialWeekIndex,
  formatMonthYear,
} from '../../../../utils/dailyRatings';
import { ANIMATION, gradients, colors } from '../../../../theme';
import { styles } from './styles';

/* ─── Constants ─── */
const MAX_BAR_HEIGHT = 80;
const BAR_AREA_HEIGHT = 100;

/* ─── Animated day bar ─── */
interface AnimatedDayBarProps {
  day: DailyRatingType;
  index: number;
  animKey: number;
}

const AnimatedDayBar: React.FC<AnimatedDayBarProps> = ({
  day,
  index,
  animKey,
}) => {
  const height = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    height.setValue(0);

    if (!day.isCurrentMonth || day.rating === null) return;

    const targetHeight = Math.max((day.rating / 5) * MAX_BAR_HEIGHT, 8);
    Animated.timing(height, {
      toValue: targetHeight,
      duration: ANIMATION.duration.slow,
      delay: index * 80,
      easing: ANIMATION.easing.enter,
      useNativeDriver: false,
    }).start();
  }, [animKey, day.rating, day.isCurrentMonth, index, height]);

  /* Adjacent-month placeholder — invisible */
  if (!day.isCurrentMonth) {
    return <View style={styles.dayColumn} />;
  }

  /* Empty day — tiny dot, no text */
  if (day.rating === null) {
    return (
      <View style={styles.dayColumn}>
        <View style={styles.barArea}>
          <View style={styles.barDot} />
        </View>
      </View>
    );
  }

  /* Rated day — gradient bar + score above */
  return (
    <View style={styles.dayColumn}>
      <View style={styles.barArea}>
        <Text style={styles.barScore}>{day.rating.toFixed(1)}</Text>
        <Animated.View style={[styles.barWrapper, { height }]}>
          <LinearGradient
            colors={[...gradients.bar]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.barGradient}
          />
        </Animated.View>
      </View>
    </View>
  );
};

/* ─── Main Component ─── */
interface DailyRatingsChartProps {
  evaluations: EvaluationInterface[];
}

export const DailyRatingsChart: React.FC<DailyRatingsChartProps> = ({
  evaluations,
}) => {
  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();
  const month = now.getMonth();

  const [chartWidth, setChartWidth] = useState(0);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const didInitialScroll = useRef(false);

  const weeks = useMemo(() => {
    const daily = buildDailyRatings(evaluations, year, month);
    return groupIntoWeeks(daily, year, month);
  }, [evaluations, year, month]);

  const totalWeeks = weeks.length;

  /* Initial scroll to current week */
  useEffect(() => {
    if (chartWidth > 0 && !didInitialScroll.current && weeks.length > 0) {
      const initial = getInitialWeekIndex(weeks);
      setActiveWeekIndex(initial);
      setAnimKey((k) => k + 1);
      if (initial > 0) {
        scrollRef.current?.scrollTo({
          x: initial * chartWidth,
          animated: false,
        });
      }
      didInitialScroll.current = true;
    }
  }, [chartWidth, weeks]);

  /* Re-trigger bar animation on week change */
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [activeWeekIndex]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (chartWidth === 0) return;
      const offsetX = event.nativeEvent.contentOffset.x;
      const idx = Math.round(offsetX / chartWidth);
      const clamped = Math.max(0, Math.min(idx, totalWeeks - 1));
      if (clamped !== activeWeekIndex) setActiveWeekIndex(clamped);
    },
    [chartWidth, totalWeeks, activeWeekIndex],
  );

  const scrollToWeek = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= totalWeeks || chartWidth === 0) return;
      scrollRef.current?.scrollTo({ x: idx * chartWidth, animated: true });
      setActiveWeekIndex(idx);
    },
    [chartWidth, totalWeeks],
  );

  const onChartLayout = useCallback((event: LayoutChangeEvent) => {
    const w = event.nativeEvent.layout.width;
    if (w > 0) setChartWidth(w);
  }, []);

  const activeWeek: DailyRatingType[] = weeks[activeWeekIndex] ?? [];
  const canGoBack = activeWeekIndex > 0;
  const canGoForward = activeWeekIndex < totalWeeks - 1;

  return (
    <Card>
      {/* ── Title row ── */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Daily Ratings</Text>
        <Text style={styles.monthLabel}>{formatMonthYear(year, month)}</Text>
      </View>

      {weeks.length === 0 ? (
        <Text style={styles.emptyText}>No rating data yet</Text>
      ) : (
        <>
          {/* ── Week navigator ── */}
          <View style={styles.weekNav}>
            <TouchableOpacity
              style={[styles.weekNavBtn, !canGoBack && styles.weekNavBtnDisabled]}
              onPress={() => scrollToWeek(activeWeekIndex - 1)}
              disabled={!canGoBack}
              activeOpacity={0.6}
            >
              <Icon
                name="arrow-left-s-line"
                size={18}
                color={canGoBack ? colors.text : colors.textDim}
              />
            </TouchableOpacity>
            <Text style={styles.weekLabel}>
              Week {activeWeekIndex + 1} of {totalWeeks}
            </Text>
            <TouchableOpacity
              style={[styles.weekNavBtn, !canGoForward && styles.weekNavBtnDisabled]}
              onPress={() => scrollToWeek(activeWeekIndex + 1)}
              disabled={!canGoForward}
              activeOpacity={0.6}
            >
              <Icon
                name="arrow-right-s-line"
                size={18}
                color={canGoForward ? colors.text : colors.textDim}
              />
            </TouchableOpacity>
          </View>

          {/* ── Day labels (TOP) ── */}
          <View style={styles.dayLabelsRow}>
            {activeWeek.map((day, idx) => (
              <View key={`label-${idx}`} style={styles.dayLabelCol}>
                <Text
                  style={[
                    styles.dayLabelText,
                    day.isToday && styles.dayLabelToday,
                    !day.isCurrentMonth && styles.dayLabelDimmed,
                  ]}
                >
                  {day.dayLabel}
                </Text>
                <Text
                  style={[
                    styles.dayNum,
                    day.isToday && styles.dayNumToday,
                    !day.isCurrentMonth && styles.dayLabelDimmed,
                  ]}
                >
                  {day.dayNumber}
                </Text>
                {day.isToday && <View style={styles.todayDot} />}
              </View>
            ))}
          </View>

          {/* ── Scrollable bars ── */}
          <View style={styles.chartWrap} onLayout={onChartLayout}>
            {chartWidth > 0 && (
              <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={chartWidth}
                decelerationRate="fast"
                onMomentumScrollEnd={handleScroll}
                scrollEventThrottle={16}
              >
                {weeks.map((week, weekIdx) => (
                  <View
                    key={`week-${weekIdx}`}
                    style={[styles.weekPage, { width: chartWidth }]}
                  >
                    {week.map((day, dayIdx) => (
                      <AnimatedDayBar
                        key={day.date}
                        day={day}
                        index={dayIdx}
                        animKey={weekIdx === activeWeekIndex ? animKey : 0}
                      />
                    ))}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </>
      )}
    </Card>
  );
};
