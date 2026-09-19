import React from 'react';
import { View, Text, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../common/Card';
import { Icon, IconName } from '../../../common/Icon';
import { TrainingSessionInterface } from '../../../../types/models.types';
import { formatTimeRange, getRelativeDate } from '../../../../utils/formatters';
import { useAnimatedEntry } from '../../../../hooks/useAnimatedEntry';
import { usePulseGlow } from '../../../../hooks/usePulseGlow';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface SessionCardProps {
  session: TrainingSessionInterface;
  onPress?: () => void;
  index?: number;
}

interface StatusConfig {
  color: string;
  bg: string;
  icon: IconName;
}

// Resolved at render time so branded colors are picked up
const getStatusConfig = (): Record<string, StatusConfig> => ({
  Scheduled: { color: colors.primary, bg: colors.primaryDim, icon: 'calendar-event-fill' },
  Live: { color: colors.warningDark, bg: colors.warningDim, icon: 'flashlight-fill' },
  Completed: { color: colors.swimmerDark, bg: colors.swimmerDim, icon: 'check-line' },
  Cancelled: { color: colors.error, bg: colors.errorDim, icon: 'close-line' },
});

// Icons pair by index with the translated message arrays in sessions.json.
const MOTIVATION_ICONS: IconName[] = [
  'rocket-fill', 'fire-fill', 'flashlight-fill', 'fire-fill', 'trophy-fill', 'drop-fill',
];
const CELEBRATION_ICONS: IconName[] = [
  'trophy-fill', 'fire-fill', 'drop-fill', 'star-fill', 'rocket-fill',
];
const MISSED_ICONS: IconName[] = ['run-fill', 'fire-fill', 'flashlight-fill'];

/** Pick a stable message + its paired icon for this session. */
const pickMessage = (
  texts: string[],
  icons: IconName[],
  sessionId: number,
): { text: string; icon: IconName } => {
  const list = texts.length > 0 ? texts : [''];
  const i = sessionId % list.length;
  return { text: list[i], icon: icons[sessionId % icons.length] };
};

export const SessionCard: React.FC<SessionCardProps> = React.memo(({
  session,
  onPress,
  index = 0,
}) => {
  const { t } = useTranslation('sessions');
  const entryStyle = useAnimatedEntry(Math.min(index, 10));
  const pulseStyle = usePulseGlow(session.status === 'Live');
  const statusConfig = getStatusConfig();
  const config = statusConfig[session.status] || statusConfig.Scheduled;
  const motivation = pickMessage(
    t('card.motivation', { returnObjects: true }) as string[],
    MOTIVATION_ICONS,
    session.id,
  );
  const relativeDate = getRelativeDate(session.date);
  const isUpcoming =
    session.status === 'Scheduled' || session.status === 'Live';
  const isCompleted = session.status === 'Completed';
  const isCancelled = session.status === 'Cancelled';
  const attended = session.attendances?.some((a) => a.present);
  // The club's real attendance XP. Never fall back to a guessed number: a card
  // saying "+25 XP" next to a detail page saying "+5 XP" is worse than no number.
  const xpLabel =
    session.xp_per_attendance != null && session.xp_per_attendance > 0
      ? t('card.xpValue', { n: session.xp_per_attendance })
      : t('card.xp');
  const celebration = pickMessage(
    t('card.celebration', { returnObjects: true }) as string[],
    CELEBRATION_ICONS,
    session.id,
  );
  const missedMsg = pickMessage(
    t('card.missedMsg', { returnObjects: true }) as string[],
    MISSED_ICONS,
    session.id,
  );

  return (
    <Animated.View style={entryStyle}>
      <Card
        onPress={onPress}
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
              { backgroundColor: config.bg },
              session.status === 'Live' ? pulseStyle : undefined,
            ]}
          >
            <Text style={[styles.statusText, { color: config.color }]}>
              {t(`status.${session.status}`)}
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
                <Icon name="flashlight-fill" size={14} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.xpValue}>{xpLabel}</Text>
                <Text style={styles.xpLabel}>{t('card.attendToEarn')}</Text>
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
                <Icon name="check-line" size={14} color={colors.swimmerDark} />
              </View>
              <View>
                <Text style={styles.earnedValue}>{xpLabel}</Text>
                <Text style={styles.earnedLabel}>{t('card.earned')}</Text>
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

        {/* Cancelled: nothing to earn — say why instead. */}
        {isCancelled && (
          <View style={styles.cancelledBanner}>
            <View style={styles.cancelledIconCircle}>
              <Icon name="close-circle-line" size={16} color={colors.error} />
            </View>
            <View style={styles.cancelledBody}>
              <Text style={styles.cancelledValue}>{t('card.cancelled')}</Text>
              <Text style={styles.cancelledReason} numberOfLines={2}>
                {session.cancellation_reason || t('card.cancelledDefault')}
              </Text>
            </View>
          </View>
        )}

        {isCompleted && !attended && (
          <View style={styles.missedBanner}>
            <View style={styles.motivationLeft}>
              <View style={styles.missedIconCircle}>
                <Icon name="close-line" size={14} color={colors.error} />
              </View>
              <View>
                <Text style={styles.missedValue}>{t('card.zeroXp')}</Text>
                <Text style={styles.missedLabel}>{t('card.missed')}</Text>
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
