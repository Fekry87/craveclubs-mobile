import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTrainingPlanStore } from '../../store/trainingPlan.store';
import { MyPlanScreen } from './MyPlanScreen';
import { WeeklyReportScreen } from '../WeeklyReport/WeeklyReportScreen';
import { MyMeasurementsScreen } from '../Measurements/MyMeasurementsScreen';
import { useAuthStore } from '../../store/auth.store';
import { colors, spacing, fontFamily, shadows } from '../../theme';

type Segment = 'plan' | 'report' | 'measurements';

interface SegmentConfig {
  key: Segment;
  label: string;
}

const SEGMENT_RADIUS = 12;
const SEGMENT_PADDING = 3;

export const PlanAndReportScreen: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<Segment>('plan');
  const [controlWidth, setControlWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const markPlanViewed = useTrainingPlanStore((s) => s.markPlanViewed);

  // القياس lives on the club's Skills feature; without it there is nothing to list.
  const measurementsEnabled = useAuthStore(
    (st) => st.user?.features?.skills_enabled === true,
  );
  const segments = useMemo<SegmentConfig[]>(
    () => [
      { key: 'plan', label: 'My Plan' },
      { key: 'report', label: 'My Report' },
      ...(measurementsEnabled
        ? [{ key: 'measurements' as const, label: 'Measurements' }]
        : []),
    ],
    [measurementsEnabled],
  );

  useFocusEffect(
    useCallback(() => {
      markPlanViewed();
      // eslint-disable-next-line -- run on focus only
    }, []),
  );

  const handleSegmentChange = useCallback(
    (segment: Segment) => {
      if (segment === activeSegment) return;
      setActiveSegment(segment);
      Animated.timing(slideAnim, {
        toValue: segments.findIndex((item) => item.key === segment),
        duration: 200,
        useNativeDriver: false,
      }).start();
    },
    [activeSegment, slideAnim, segments],
  );

  const onControlLayout = useCallback((e: LayoutChangeEvent) => {
    setControlWidth(e.nativeEvent.layout.width);
  }, []);

  // Indicator dimensions based on measured width
  const indicatorWidth = controlWidth > 0
    ? (controlWidth - SEGMENT_PADDING * 2) / segments.length
    : 0;

  const indicatorLeft = slideAnim.interpolate({
    inputRange: [0, Math.max(1, segments.length - 1)],
    outputRange: [
      SEGMENT_PADDING,
      SEGMENT_PADDING + indicatorWidth * Math.max(1, segments.length - 1),
    ],
  });

  return (
    <View style={s.container}>
      {/* Segment Control */}
      <View style={s.segmentWrapper}>
        <View style={s.segmentControl} onLayout={onControlLayout}>
          {controlWidth > 0 && (
            <Animated.View
              style={[
                s.segmentIndicator,
                {
                  width: indicatorWidth,
                  left: indicatorLeft,
                },
              ]}
            />
          )}
          {segments.map((segment) => (
            <TouchableOpacity
              key={segment.key}
              style={s.segmentBtn}
              onPress={() => handleSegmentChange(segment.key)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeSegment === segment.key }}
            >
              <Text
                style={[
                  s.segmentText,
                  activeSegment === segment.key && s.segmentTextActive,
                ]}
                numberOfLines={1}
              >
                {segment.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content — all mounted, toggle visibility to preserve state */}
      <View style={[s.content, activeSegment !== 'plan' && s.hidden]}>
        <MyPlanScreen />
      </View>
      <View style={[s.content, activeSegment !== 'report' && s.hidden]}>
        <WeeklyReportScreen />
      </View>
      {measurementsEnabled && (
        <View style={[s.content, activeSegment !== 'measurements' && s.hidden]}>
          <MyMeasurementsScreen />
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  segmentWrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: SEGMENT_RADIUS,
    padding: SEGMENT_PADDING,
  },
  segmentIndicator: {
    position: 'absolute',
    top: SEGMENT_PADDING,
    bottom: SEGMENT_PADDING,
    backgroundColor: colors.white,
    borderRadius: SEGMENT_RADIUS - 2,
    ...shadows.md,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: 2,
    alignItems: 'center',
    zIndex: 1,
  },
  segmentText: {
    fontSize: 14,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },
  segmentTextActive: {
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  hidden: {
    display: 'none',
  },
});
