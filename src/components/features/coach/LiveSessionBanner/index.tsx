import React from 'react';
import { View, Text, Animated } from 'react-native';
import { Card } from '../../../common/Card';
import { CoachSessionInterface } from '../../../../types/models.types';
import { Button } from '../../../common/Button';
import { usePulseGlow } from '../../../../hooks/usePulseGlow';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface LiveSessionBannerProps {
  session: CoachSessionInterface;
  onPress?: () => void;
}

export const LiveSessionBanner: React.FC<LiveSessionBannerProps> = ({
  session,
  onPress,
}) => {
  const pulseStyle = usePulseGlow(true);

  return (
    <Card accentColor={colors.warning}>
      {/* Live indicator row */}
      <View style={styles.liveRow}>
        <Animated.View style={[styles.liveDot, pulseStyle]} />
        <Text style={styles.liveText}>LIVE NOW</Text>
      </View>

      {/* Session info */}
      <Text style={styles.title} numberOfLines={1}>
        {session.title || session.type}
      </Text>
      <Text style={styles.groupText} numberOfLines={1}>
        {session.group?.name ?? 'Unknown Group'}
      </Text>

      {/* Action button */}
      {onPress && (
        <Button
          title="Join Session"
          variant="blue"
          onPress={onPress}
        />
      )}
    </Card>
  );
};
