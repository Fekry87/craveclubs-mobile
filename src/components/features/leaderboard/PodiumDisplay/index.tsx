import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../../../common/Icon';
import { SeaCharacter } from '../SeaCharacter';
import { LeaderboardEntryInterface } from '../../../../types/models.types';
import { colors, gradients, fontFamily, spacing, borderRadius } from '../../../../theme';
import { styles } from './styles';

interface PodiumDisplayProps {
  top3: LeaderboardEntryInterface[];
}

/** Podium slot for positions 2nd and 3rd */
const PodiumSlot: React.FC<{
  entry: LeaderboardEntryInterface;
  rank: 2 | 3;
}> = ({ entry, rank }) => {
  const gradient = rank === 2 ? gradients.silver : gradients.bronze;
  const medalColor = rank === 2 ? '#A0AEC0' : '#CD7F32';

  const displayName = entry.is_current_user
    ? entry.full_name || `${entry.first_name} ${entry.last_initial}`
    : `${entry.first_name} ${entry.last_initial}`;

  return (
    <View style={styles.podiumSlot}>
      {/* Avatar with medal ring */}
      <View style={[styles.slotAvatarRing, { borderColor: medalColor }]}>
        <SeaCharacter swimmerId={entry.swimmer_id} size={46} />
        {/* Rank circle overlapping bottom-right */}
        <LinearGradient
          colors={[...gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.slotRankCircle}
        >
          <Text style={styles.slotRankText}>{rank}</Text>
        </LinearGradient>
      </View>
      <Text style={styles.slotName} numberOfLines={1}>{displayName}</Text>
      <View style={styles.slotXpRow}>
        <Icon name="flashlight-fill" size={11} color={medalColor} />
        <Text style={[styles.slotXp, { color: medalColor }]}>
          {entry.total_xp.toLocaleString()}
        </Text>
      </View>
      {/* Podium block */}
      <View
        style={[
          styles.podiumBlock,
          rank === 2 ? styles.podiumBlockSilver : styles.podiumBlockBronze,
        ]}
      >
        <Icon name="medal-fill" size={14} color={medalColor} />
      </View>
    </View>
  );
};

/** Champion center slot (#1) with animations */
const ChampionSlot: React.FC<{ entry: LeaderboardEntryInterface }> = ({
  entry,
}) => {
  const crownBounce = useRef(new Animated.Value(0)).current;
  const sparkle = useRef(new Animated.Value(0.3)).current;
  const scaleIn = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleIn, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(crownBounce, {
            toValue: -5,
            duration: 1000,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(crownBounce, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkle, {
            toValue: 1,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle, {
            toValue: 0.3,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
  }, [crownBounce, sparkle, scaleIn]);

  const displayName = entry.is_current_user
    ? entry.full_name || `${entry.first_name} ${entry.last_initial}`
    : `${entry.first_name} ${entry.last_initial}`;

  return (
    <Animated.View
      style={[styles.championSlot, { transform: [{ scale: scaleIn }] }]}
    >
      {/* Floating crown */}
      <Animated.View
        style={[
          styles.crownFloat,
          { transform: [{ translateY: crownBounce }] },
        ]}
      >
        <Icon name="vip-crown-fill" size={28} color="#FFC800" />
      </Animated.View>

      {/* Gold ring avatar */}
      <LinearGradient
        colors={[...gradients.gold]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.championRing}
      >
        <SeaCharacter swimmerId={entry.swimmer_id} size={60} showBubbles />
      </LinearGradient>

      {/* Sparkle dots */}
      <Animated.View
        style={[styles.sparkleL, { opacity: sparkle }]}
      >
        <Icon name="sparkling-fill" size={14} color="#FFC800" />
      </Animated.View>
      <Animated.View
        style={[styles.sparkleR, { opacity: sparkle }]}
      >
        <Icon name="sparkling-2-fill" size={12} color="#FF9600" />
      </Animated.View>

      <Text style={styles.championName} numberOfLines={1}>{displayName}</Text>
      <View style={styles.championXpRow}>
        <Icon name="flashlight-fill" size={14} color="#FFC800" />
        <Text style={styles.championXp}>
          {entry.total_xp.toLocaleString()}
        </Text>
        <Text style={styles.championXpSuffix}>XP</Text>
      </View>

      {/* Podium block (tallest) */}
      <View style={[styles.podiumBlock, styles.podiumBlockGold]}>
        <View style={styles.goldLevelBadge}>
          <Text style={styles.goldLevelText}>{entry.level_name}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

export const PodiumDisplay: React.FC<PodiumDisplayProps> = ({ top3 }) => {
  if (top3.length === 0) return null;

  const first = top3[0];
  const second = top3.length > 1 ? top3[1] : null;
  const third = top3.length > 2 ? top3[2] : null;

  return (
    <View style={styles.container}>
      {/* Podium row:  2nd | 1st (elevated) | 3rd */}
      <View style={styles.podiumRow}>
        {second ? (
          <PodiumSlot entry={second} rank={2} />
        ) : (
          <View style={styles.podiumSlot} />
        )}
        {first && <ChampionSlot entry={first} />}
        {third ? (
          <PodiumSlot entry={third} rank={3} />
        ) : (
          <View style={styles.podiumSlot} />
        )}
      </View>
    </View>
  );
};
