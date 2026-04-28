import React from 'react';
import { View, Text, Animated } from 'react-native';
import { Card } from '../../../common/Card';
import { Icon, IconName } from '../../../common/Icon';
import { TrainingSessionInterface } from '../../../../types/models.types';
import { formatTimeRange, getRelativeDate } from '../../../../utils/formatters';
import { useAnimatedEntry } from '../../../../hooks/useAnimatedEntry';
import { usePulseGlow } from '../../../../hooks/usePulseGlow';
import { colors, spacing, fontFamily, borderRadius } from '../../../../theme';
import { styles } from './styles';

interface SessionCardProps {
  session: TrainingSessionInterface;
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

// Motivational messages to encourage attendance (upcoming)
const MOTIVATION_MESSAGES = [
  { text: 'Show up & level up!', icon: 'rocket-fill' as IconName },
  { text: 'Every lap counts!', icon: 'fire-fill' as IconName },
  { text: 'Dive in & earn XP!', icon: 'flashlight-fill' as IconName },
  { text: 'Keep your streak alive!', icon: 'fire-fill' as IconName },
  { text: 'Champions train daily!', icon: 'trophy-fill' as IconName },
  { text: 'Make a splash!', icon: 'drop-fill' as IconName },
];

// Celebration messages for attended sessions
const CELEBRATION_MESSAGES = [
  { text: 'Great job, champ!', icon: 'trophy-fill' as IconName },
  { text: 'You crushed it!', icon: 'fire-fill' as IconName },
  { text: 'Keep swimming!', icon: 'drop-fill' as IconName },
  { text: 'Way to go!', icon: 'star-fill' as IconName },
  { text: 'Amazing effort!', icon: 'rocket-fill' as IconName },
];

// Encouraging messages for missed sessions
const MISSED_MESSAGES = [
  { text: 'Catch the next one!', icon: 'run-fill' as IconName },
  { text: "You'll get it next time!", icon: 'fire-fill' as IconName },
  { text: 'Come back stronger!', icon: 'flashlight-fill' as IconName },
];

const getMotivation = (sessionId: number) => {
  return MOTIVATION_MESSAGES[sessionId % MOTIVATION_MESSAGES.length];
};

const getCelebration = (sessionId: number) => {
  return CELEBRATION_MESSAGES[sessionId % CELEBRATION_MESSAGES.length];
};

const getMissedMessage = (sessionId: number) => {
  return MISSED_MESSAGES[sessionId % MISSED_MESSAGES.length];
};

export const SessionCard: React.FC<SessionCardProps> = React.memo(({
  session,
  onPress,
  index = 0,
}) => {
  const entryStyle = useAnimatedEntry(Math.min(index, 10));
  const pulseStyle = usePulseGlow(session.status === 'Live');
  const config = STATUS_CONFIG[session.status] || STATUS_CONFIG.Scheduled;
  const motivation = getMotivation(session.id);
  const relativeDate = getRelativeDate(session.date);
  const isUpcoming =
    session.status === 'Scheduled' || session.status === 'Live';
  const isCompleted = session.status === 'Completed';
  const attended = session.attendances?.some((a) => a.present);
  const celebration = getCelebration(session.id);
  const missedMsg = getMissedMessage(session.id);

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

        {/* Meta: Date · Time */}
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
            <Text style={styles.infoText}>{session.group.name}</Text>
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

        {/* Bottom: Reward banner — upcoming shows XP to earn, completed shows what was gained */}
        {isUpcoming && (
          <View style={styles.motivationBanner}>
            <View style={styles.motivationLeft}>
              <View style={styles.xpIconCircle}>
                <Icon name="flashlight-fill" size={14} color={colors.white} />
              </View>
              <View>
                <Text style={styles.xpValue}>+25 XP</Text>
                <Text style={styles.xpLabel}>Attend to earn</Text>
              </View>
            </View>
            <View style={styles.motivationRight}>
              <Icon
                name={motivation.icon}
                size={15}
                color={colors.orange}
              />
              <Text style={styles.motivationText} numberOfLines={1}>
                {motivation.text}
              </Text>
            </View>
          </View>
        )}

        {isCompleted && attended && (
          <View style={styles.earnedBanner}>
            <View style={styles.motivationLeft}>
              <View style={styles.earnedIconCircle}>
                <Icon name="check-line" size={14} color={colors.white} />
              </View>
              <View>
                <Text style={styles.earnedValue}>+25 XP</Text>
                <Text style={styles.earnedLabel}>Earned</Text>
              </View>
            </View>
            <View style={styles.motivationRight}>
              <Icon
                name={celebration.icon}
                size={15}
                color={colors.swimmer}
              />
              <Text style={styles.earnedText} numberOfLines={1}>
                {celebration.text}
              </Text>
            </View>
          </View>
        )}

        {isCompleted && !attended && (
          <View style={styles.missedBanner}>
            <View style={styles.motivationLeft}>
              <View style={styles.missedIconCircle}>
                <Icon name="close-line" size={14} color={colors.white} />
              </View>
              <View>
                <Text style={styles.missedValue}>0 XP</Text>
                <Text style={styles.missedLabel}>Missed</Text>
              </View>
            </View>
            <View style={styles.motivationRight}>
              <Icon
                name={missedMsg.icon}
                size={15}
                color={colors.orange}
              />
              <Text style={styles.missedText} numberOfLines={1}>
                {missedMsg.text}
              </Text>
            </View>
          </View>
        )}
      </Card>
    </Animated.View>
  );
});
