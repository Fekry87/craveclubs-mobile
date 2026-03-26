import React, { useState, useCallback, useRef } from 'react';
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
import { colors, spacing, fontFamily, shadows } from '../../theme';

type Segment = 'plan' | 'report';

const SEGMENT_RADIUS = 12;
const SEGMENT_PADDING = 3;

export const PlanAndReportScreen: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<Segment>('plan');
  const [controlWidth, setControlWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const markPlanViewed = useTrainingPlanStore((s) => s.markPlanViewed);

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
        toValue: segment === 'plan' ? 0 : 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    },
    [activeSegment, slideAnim],
  );

  const onControlLayout = useCallback((e: LayoutChangeEvent) => {
    setControlWidth(e.nativeEvent.layout.width);
  }, []);

  // Indicator dimensions based on measured width
  const indicatorWidth = controlWidth > 0
    ? (controlWidth - SEGMENT_PADDING * 2) / 2
    : 0;

  const indicatorLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SEGMENT_PADDING, SEGMENT_PADDING + indicatorWidth],
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
          <TouchableOpacity
            style={s.segmentBtn}
            onPress={() => handleSegmentChange('plan')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                s.segmentText,
                activeSegment === 'plan' && s.segmentTextActive,
              ]}
            >
              My Plan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.segmentBtn}
            onPress={() => handleSegmentChange('report')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                s.segmentText,
                activeSegment === 'report' && s.segmentTextActive,
              ]}
            >
              My Report
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content — both mounted, toggle visibility to preserve state */}
      <View style={[s.content, activeSegment !== 'plan' && s.hidden]}>
        <MyPlanScreen />
      </View>
      <View style={[s.content, activeSegment !== 'report' && s.hidden]}>
        <WeeklyReportScreen />
      </View>
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
