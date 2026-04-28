import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon, IconName } from '../../../common/Icon';
import { colors } from '../../../../theme';
import { styles } from './styles';

type StatusKey = 'all' | 'upcoming' | 'completed';

interface SessionStatusFilterProps {
  activeStatus: StatusKey;
  onSelect: (status: StatusKey) => void;
  counts?: {
    all: number;
    upcoming: number;
    completed: number;
  };
}

interface SegmentConfig {
  key: StatusKey;
  label: string;
  icon: IconName;
}

const SEGMENTS: SegmentConfig[] = [
  { key: 'all', label: 'All', icon: 'list-check-2' },
  { key: 'upcoming', label: 'Upcoming', icon: 'calendar-event-line' },
  { key: 'completed', label: 'Completed', icon: 'check-line' },
];

export const SessionStatusFilter: React.FC<SessionStatusFilterProps> = ({
  activeStatus,
  onSelect,
  counts,
}) => {
  return (
    <View style={styles.segmentBar}>
      {SEGMENTS.map((seg) => {
        const isActive = activeStatus === seg.key;
        const count = counts?.[seg.key] ?? 0;

        return (
          <TouchableOpacity
            key={seg.key}
            style={[
              styles.segmentTab,
              isActive && styles.segmentTabActive,
            ]}
            onPress={() => onSelect(seg.key)}
            activeOpacity={0.7}
          >
            <Icon
              name={seg.icon}
              size={16}
              color={isActive ? colors.white : colors.textMuted}
            />
            <Text
              style={[
                styles.segmentLabel,
                isActive && styles.segmentLabelActive,
              ]}
            >
              {seg.label}
            </Text>
            <View
              style={[
                styles.countBadge,
                isActive && styles.countBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.countText,
                  isActive && styles.countTextActive,
                ]}
              >
                {count}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
