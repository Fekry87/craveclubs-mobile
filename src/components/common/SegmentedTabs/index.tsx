import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { s, SEGMENT_PADDING } from './styles';

export interface SegmentItem {
  key: string;
  label: string;
}

interface SegmentedTabsProps {
  segments: SegmentItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

/**
 * Animated iOS-style segmented control — a white pill slides under the active
 * label. Shared by the screens that carry sub-tabs (My Plan, Progress).
 */
export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  segments,
  activeKey,
  onChange,
}) => {
  const [controlWidth, setControlWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const activeIndex = Math.max(
    0,
    segments.findIndex((item) => item.key === activeKey),
  );

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: activeIndex,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [activeIndex, slideAnim]);

  const onControlLayout = useCallback((e: LayoutChangeEvent) => {
    setControlWidth(e.nativeEvent.layout.width);
  }, []);

  const indicatorWidth =
    controlWidth > 0
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
    <View style={s.segmentWrapper}>
      <View style={s.segmentControl} onLayout={onControlLayout}>
        {controlWidth > 0 && (
          <Animated.View
            style={[
              s.segmentIndicator,
              // `left` is auto-mirrored to the right edge under RTL by RN's
              // doLeftAndRightSwapInRTL (left on by default), so the pill lands
              // under the active label in both directions — do not swap by hand.
              { width: indicatorWidth, left: indicatorLeft },
            ]}
          />
        )}
        {segments.map((segment) => (
          <TouchableOpacity
            key={segment.key}
            style={s.segmentBtn}
            onPress={() => onChange(segment.key)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeKey === segment.key }}
          >
            <Text
              style={[
                s.segmentText,
                activeKey === segment.key && s.segmentTextActive,
              ]}
              numberOfLines={1}
            >
              {segment.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
