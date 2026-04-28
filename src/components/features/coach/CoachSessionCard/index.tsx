import React from 'react';
import { View, Text, Animated } from 'react-native';
import { Card } from '../../../common/Card';
import { Icon, IconName } from '../../../common/Icon';
import { CoachSessionInterface } from '../../../../types/models.types';
import { formatTimeRange, getRelativeDate } from '../../../../utils/formatters';
import { useAnimatedEntry } from '../../../../hooks/useAnimatedEntry';
import { usePulseGlow } from '../../../../hooks/usePulseGlow';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface CoachSessionCardProps {
  session: CoachSessionInterface;
  onPress?: () => void;
  index?: number;
}

const STATUS_CONFIG: Record<
  string,
  { color: string; textColor: string; icon: IconName }
> = {
  Scheduled: {
    color: colors.primary,
    textColor: colors.white,
    icon: 'calendar-event-fill',
  },
  Live: {
    color: colors.warning,
    textColor: colors.text,
    icon: 'flashlight-fill',
  },
  Completed: {
    color: colors.swimmer,
    textColor: colors.white,
    icon: 'check-line',
  },
  Cancelled: {
    color: colors.error,
    textColor: colors.white,
    icon: 'close-line',
  },
};

export const CoachSessionCard: React.FC<CoachSessionCardProps> = React.memo(({
  session,
  onPress,
  index = 0,
}) => {
  const entryStyle = useAnimatedEntry(Math.min(index, 10));
  const pulseStyle = usePulseGlow(session.status === 'Live');
  const config = STATUS_CONFIG[session.status] || STATUS_CONFIG.Scheduled;
  const relativeDate = getRelativeDate(session.date);

  return (
    <Animated.View style={entryStyle}>
      <Card
        onPress={onPress}
        accentColor={config.color}
        style={styles.container}
      >
        {/* Top: Title + Status badge */}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {session.title || session.type}
          </Text>
          <Animated.View
            style={[
              styles.statusBadge,
              { backgroundColor: config.color },
              session.status === 'Live' ? pulseStyle : undefined,
            ]}
          >
            <Text style={[styles.statusText, { color: config.textColor }]}>
              {session.status}
            </Text>
          </Animated.View>
        </View>

        {/* Meta: Date + Time */}
        <View style={styles.metaRow}>
          <Text style={styles.dateText}>{relativeDate}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.timeText}>
            {formatTimeRange(session.start_time, session.end_time)}
          </Text>
        </View>

        {/* Info chips: group + location */}
        <View style={styles.infoRow}>
          <View style={styles.infoChip}>
            <Icon name="group-line" size={12} color={colors.textMuted} />
            <Text style={styles.infoText}>
              {session.group?.name ?? 'Unknown Group'}
            </Text>
          </View>
          {session.location && (
            <View style={styles.infoChip}>
              <Icon
                name="map-pin-line"
                size={12}
                color={colors.textMuted}
              />
              <Text style={styles.infoText} numberOfLines={1}>
                {session.location}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </Animated.View>
  );
});
