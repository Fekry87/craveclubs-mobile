import React from 'react';
import { View, Text, Animated } from 'react-native';
import { Card } from '../../../common/Card';
import { Icon } from '../../../common/Icon';
import { SwimmerAvatar } from '../../../common/SwimmerAvatar';
import { LeaderboardEntryInterface } from '../../../../types/models.types';
import { useAnimatedEntry } from '../../../../hooks/useAnimatedEntry';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface LeaderboardCardProps {
  entry: LeaderboardEntryInterface;
  index?: number;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = React.memo(({
  entry,
  index = 0,
}) => {
  const entryStyle = useAnimatedEntry(Math.min(index, 10));

  const displayName = entry.is_current_user
    ? entry.full_name || `${entry.first_name} ${entry.last_initial}`
    : `${entry.first_name} ${entry.last_initial}`;

  return (
    <Animated.View style={entryStyle}>
      <Card
        style={[
          styles.cardSpacing,
          entry.is_current_user && {
            backgroundColor: colors.primaryDim,
            borderColor: colors.primary,
          },
        ]}
      >
        <View style={styles.row}>
          {/* Rank number */}
          <View style={styles.rankColumn}>
            <Text
              style={[
                styles.rankText,
                entry.rank <= 3 && styles.rankTextTop,
              ]}
            >
              {entry.rank}
            </Text>
          </View>

          {/* Sea character avatar */}
          <View style={styles.avatarColumn}>
            <SwimmerAvatar
              avatarUrl={entry.avatar_url}
              swimmerId={entry.swimmer_id}
              size={42}
              fallback="character"
              showBubbles={entry.is_current_user}
            />
          </View>

          {/* Name & level */}
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {displayName}
              </Text>
              {entry.is_current_user && (
                <View style={[styles.youBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.youBadgeText, { color: colors.white }]}>You</Text>
                </View>
              )}
            </View>
            <View style={styles.levelRow}>
              <View
                style={[
                  styles.levelDot,
                  { backgroundColor: entry.level_color },
                ]}
              />
              <Text style={styles.levelName}>{entry.level_name}</Text>
            </View>
          </View>

          {/* XP display */}
          <View style={styles.xpContainer}>
            <View style={styles.xpRow}>
              <Icon name="flashlight-fill" size={14} color={colors.primary} />
              <Text style={styles.xp}>{entry.total_xp.toLocaleString()}</Text>
            </View>
            <Text style={styles.xpLabel}>XP</Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
});
