import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../../../common/Card';
import { Icon } from '../../../common/Icon';
import { SwimmerAvatar } from '../../../common/SwimmerAvatar';
import { SwimmerAwardInterface } from '../../../../types/models.types';
import { AWARD_ICON } from '../../../../utils/awards';
import { getRelativeDate } from '../../../../utils/formatters';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface AwardRowProps {
  award: SwimmerAwardInterface;
  first: boolean;
}

const AwardRow: React.FC<AwardRowProps> = React.memo(({ award, first }) => (
  <View
    style={[styles.row, !first && styles.rowDivider]}
    accessibilityLabel={`${award.swimmer_name}, ${award.award_name}, ${award.xp_value} XP`}
  >
    <View style={styles.avatarWrap}>
      <SwimmerAvatar
        avatarUrl={award.swimmer_avatar_url}
        swimmerId={award.swimmer_id}
        size={44}
        fallback="character"
      />
    </View>
    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={1}>
        {award.swimmer_name}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {award.award_name}
        {award.awarded_at ? ` · ${getRelativeDate(award.awarded_at)}` : ''}
      </Text>
    </View>
    <View style={styles.right}>
      <View style={styles.typePill}>
        <Icon name={AWARD_ICON} size={11} color={colors.warningDark} />
      </View>
      <Text style={[styles.xp, { color: colors.primary }]}>+{award.xp_value} XP</Text>
    </View>
  </View>
));

AwardRow.displayName = 'AwardRow';

interface RecentAwardsProps {
  awards: SwimmerAwardInterface[];
}

/**
 * The club's hall of fame: every Man of the Day / Week / Month, newest first.
 * Permanent and club-wide, unlike the one-time celebration card — a swimmer
 * can browse who won what long after dismissing the popup. Renders nothing
 * when the club has given no awards yet.
 */
export const RecentAwards: React.FC<RecentAwardsProps> = ({ awards }) => {
  if (awards.length === 0) return null;

  return (
    <Card style={styles.card}>
      {awards.map((award, index) => (
        <AwardRow key={award.award_id} award={award} first={index === 0} />
      ))}
    </Card>
  );
};
