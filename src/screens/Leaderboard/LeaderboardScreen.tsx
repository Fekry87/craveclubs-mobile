import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { ErrorView } from '../../components/common/ErrorView';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon, IconName } from '../../components/common/Icon';
import { SeaCharacter } from '../../components/features/leaderboard/SeaCharacter';
import { PodiumDisplay } from '../../components/features/leaderboard/PodiumDisplay';
import { LeaderboardCard } from '../../components/features/leaderboard/LeaderboardCard';
import { LevelCharacter } from '../../components/features/leaderboard/LevelCharacter';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { progressService } from '../../api/services/progress.service';
import { LeaderboardResponseType } from '../../types/api.types';
import { LevelTierInterface } from '../../types/models.types';
import {
  colors,
  spacing,
  fontFamily,
  borderRadius,
  shadows,
} from '../../theme';

/* ─── XP Mini-stat row item ─── */
interface XpStatProps {
  icon: IconName;
  value: number;
  label: string;
  color: string;
  dimColor: string;
}

const XpStat: React.FC<XpStatProps> = ({ icon, value, label, color, dimColor }) => (
  <View style={s.xpStat}>
    <View style={[s.xpStatIcon, { backgroundColor: dimColor }]}>
      <Icon name={icon} size={14} color={color} />
    </View>
    <View style={s.xpStatText}>
      <Text style={[s.xpStatValue, { color }]}>{value}</Text>
      <Text style={s.xpStatLabel}>{label}</Text>
    </View>
  </View>
);

/* ─── Level Step (gamification) ─── */
type LevelStatus = 'completed' | 'active' | 'locked';

interface LevelStepProps {
  tier: LevelTierInterface;
  status: LevelStatus;
}

const LevelStep: React.FC<LevelStepProps> = ({ tier, status }) => (
  <View style={s.levelStep}>
    <View
      style={[
        s.levelStepCircle,
        status === 'completed' && s.levelStepCompleted,
        status === 'active' && [s.levelStepActive, { borderColor: tier.color }],
        status === 'locked' && s.levelStepLocked,
      ]}
    >
      {status === 'completed' ? (
        <Icon name="check-line" size={16} color={colors.white} />
      ) : status === 'active' ? (
        <LevelCharacter levelName={tier.name} size={32} />
      ) : (
        <View style={s.lockedCharacterWrap}>
          <LevelCharacter levelName={tier.name} size={30} />
          <View style={s.lockOverlayCentered}>
            <Icon name="lock-line" size={14} color={colors.white} />
          </View>
        </View>
      )}
    </View>
    <Text
      style={[
        s.levelStepLabel,
        status === 'active' && { color: colors.text, fontFamily: fontFamily.bodySemiBold },
        status === 'locked' && { color: colors.textDim },
      ]}
      numberOfLines={1}
    >
      {tier.name.split(' ')[0]}
    </Text>
    <Text
      style={[
        s.levelStepXp,
        status === 'active' && { color: colors.text },
        status === 'locked' && { color: colors.textDim },
      ]}
    >
      {tier.xp} XP
    </Text>
  </View>
);

/* ─── Leaderboard Screen ─── */
export const LeaderboardScreen: React.FC = () => {
  const [data, setData] = useState<LeaderboardResponseType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const podiumEntry = useAnimatedEntry(0);
  const myCardEntry = useAnimatedEntry(1);
  const statsEntry = useAnimatedEntry(2);
  const rankingsEntry = useAnimatedEntry(3);

  // Crown float animation
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [floatAnim]);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  const fetchLeaderboard = useCallback(async () => {
    try {
      setError(null);
      const response = await progressService.getLeaderboard();
      setData(response);
    } catch {
      setError('Failed to load leaderboard.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard();
      // eslint-disable-next-line -- run on focus only
    }, []),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  if (isLoading) return <Loader message="Loading leaderboard..." />;
  if (error) return <ErrorView message={error} onRetry={fetchLeaderboard} />;
  if (!data) return <EmptyState icon="trophy-line" title="No leaderboard data" />;

  const top3 = data.all_rankings.filter((e) => e.rank <= 3);
  const restRankings = data.all_rankings.filter((e) => e.rank > 3);
  const currentUser = data.all_rankings.find((e) => e.is_current_user);

  /* Determine each level's status: completed / active / locked */
  const getLevelStatus = (tier: LevelTierInterface): LevelStatus => {
    if (tier.level < data.my_level.level) return 'completed';
    if (tier.level === data.my_level.level) return 'active';
    return 'locked';
  };

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* ═══ Section 1: Top Swimmers Podium (Card) ═══ */}
      {top3.length > 0 && (
        <Animated.View style={podiumEntry}>
          <Card style={s.podiumCard}>
            <View style={s.podiumHeader}>
              <Animated.View style={{ transform: [{ translateY: floatY }] }}>
                <Icon name="trophy-fill" size={20} color={colors.warning} />
              </Animated.View>
              <Text style={s.podiumTitle}>Top Swimmers</Text>
              <View style={s.swimmerCountPill}>
                <Icon name="group-fill" size={11} color={colors.textMuted} />
                <Text style={s.swimmerCountText}>{data.total_swimmers}</Text>
              </View>
            </View>
            <PodiumDisplay top3={top3} />
          </Card>
        </Animated.View>
      )}

      {/* ═══ Section 2: Level & XP Card ═══ */}
      <Animated.View style={myCardEntry}>
        <Card style={s.levelCard}>
          {/* ── Top: Avatar + Name/XP | Level Character ── */}
          <View style={s.levelCardHeader}>
            {currentUser && (
              <View style={s.myAvatarWrap}>
                <SeaCharacter swimmerId={currentUser.swimmer_id} size={48} />
                <View style={s.myRankBadge}>
                  <Text style={s.myRankBadgeText}>#{data.my_rank}</Text>
                </View>
              </View>
            )}
            <View style={s.myCardInfo}>
              <View style={s.myNameRow}>
                <Text style={s.myName}>
                  {currentUser
                    ? currentUser.full_name ||
                      `${currentUser.first_name} ${currentUser.last_initial}`
                    : 'You'}
                </Text>
                <Text style={s.myNameDot}>{' \u2022 '}</Text>
                <Text style={[s.myLevelInline, { color: data.my_level.color }]}>
                  {data.my_level.name}
                </Text>
              </View>
              <View style={s.myXpRow}>
                <Icon name="flashlight-fill" size={16} color={colors.primary} />
                <Text style={s.myXpValue}>
                  {data.my_xp.total_xp.toLocaleString()}
                </Text>
                <Text style={s.myXpSuffix}>XP</Text>
              </View>
            </View>
            {/* Right: Current level character */}
            <View style={[s.headerLevelCircle, { borderColor: data.my_level.color }]}>
              <LevelCharacter levelName={data.my_level.name} size={52} />
            </View>
          </View>

          {/* ── Divider ── */}
          <View style={s.divider} />

          {/* ── Gamification Level Progression ── */}
          <View style={s.levelProgression}>
            {/* Level steps row */}
            <View style={s.levelStepsRow}>
              {data.levels.map((tier, idx) => (
                <React.Fragment key={tier.level}>
                  {idx > 0 && (
                    <View
                      style={[
                        s.levelConnector,
                        getLevelStatus(tier) === 'completed' || getLevelStatus(tier) === 'active'
                          ? s.levelConnectorFilled
                          : s.levelConnectorEmpty,
                      ]}
                    />
                  )}
                  <LevelStep tier={tier} status={getLevelStatus(tier)} />
                </React.Fragment>
              ))}
            </View>

            {/* XP to next level — left aligned */}
            {data.my_level.xp_to_next > 0 && (
              <View style={s.xpLeftRow}>
                <Icon name="flashlight-line" size={13} color={colors.primary} />
                <Text style={s.xpLeftText}>
                  <Text style={s.xpLeftValue}>{data.my_level.xp_to_next}</Text>
                  {` XP to be a ${data.my_level.next_level_name}`}
                </Text>
              </View>
            )}
          </View>
        </Card>
      </Animated.View>

      {/* ═══ Section 3: Statistics Card ═══ */}
      <Animated.View style={statsEntry}>
        <Card style={s.statsCard}>
          <View style={s.xpBreakdownRow}>
            <XpStat
              icon="star-fill"
              value={data.my_xp.rating_xp}
              label="Rating"
              color={colors.orange}
              dimColor={colors.orangeDim}
            />
            <View style={s.xpDivider} />
            <XpStat
              icon="check-line"
              value={data.my_xp.attendance_xp}
              label="Attend"
              color={colors.swimmer}
              dimColor={colors.swimmerDim}
            />
            <View style={s.xpDivider} />
            <XpStat
              icon="fire-fill"
              value={data.my_xp.streak_xp}
              label="Streak"
              color={colors.error}
              dimColor={colors.errorDim}
            />
          </View>
        </Card>
      </Animated.View>

      {/* ═══ Section 4: All Swimmers Rankings ═══ */}
      {restRankings.length > 0 && (
        <Animated.View style={rankingsEntry}>
          <View style={s.sectionHeader}>
            <Icon
              name="bar-chart-box-fill"
              size={18}
              color={colors.textMuted}
            />
            <Text style={s.sectionTitle}>All Swimmers</Text>
            <View style={s.countChip}>
              <Text style={s.countChipText}>{data.all_rankings.length}</Text>
            </View>
          </View>
          {restRankings.map((entry, index) => (
            <LeaderboardCard
              key={entry.swimmer_id}
              entry={entry}
              index={index}
            />
          ))}
        </Animated.View>
      )}
    </ScrollView>
  );
};

/* ─── Styles ─── */
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },

  /* ═══ Podium Card ═══ */
  podiumCard: {
    marginBottom: spacing.md,
  },
  podiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  podiumTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  swimmerCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  swimmerCountText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },

  /* ═══ Level & XP Card ═══ */
  levelCard: {
    marginBottom: spacing.md,
  },

  /* Header: Avatar + Name/Level + XP */
  levelCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  myAvatarWrap: {
    position: 'relative',
  },
  myRankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -6,
    backgroundColor: colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.sm,
  },
  myRankBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.headingBold,
    color: colors.white,
  },
  myCardInfo: {
    flex: 1,
  },
  myNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  myName: {
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  myNameDot: {
    fontSize: 14,
    color: colors.textDim,
  },
  myLevelInline: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
  },
  myXpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  myXpValue: {
    fontSize: 22,
    fontFamily: fontFamily.headingHeavy,
    color: colors.primary,
    lineHeight: 26,
  },
  myXpSuffix: {
    fontSize: 13,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },

  /* Header level character circle */
  headerLevelCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    overflow: 'hidden',
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md - 2,
  },

  /* ═══ Gamification Level Progression ═══ */
  levelProgression: {
    gap: spacing.md,
  },
  levelStepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Individual level step */
  levelStep: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 52,
  },
  levelStepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
    overflow: 'hidden',
  },
  levelStepCompleted: {
    backgroundColor: colors.swimmer,
    borderColor: colors.swimmerDark,
  },
  levelStepActive: {
    backgroundColor: colors.white,
    borderWidth: 3,
    ...shadows.sm,
  },
  levelStepLocked: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.borderLight,
  },
  lockedCharacterWrap: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockOverlayCentered: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black + '59',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelStepLabel: {
    fontSize: 9,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
  },
  levelStepXp: {
    fontSize: 8,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    textAlign: 'center',
  },

  /* Connector line between steps */
  levelConnector: {
    height: 2,
    flex: 1,
    marginBottom: spacing.xl + spacing.xs,
  },
  levelConnectorFilled: {
    backgroundColor: colors.swimmer,
  },
  levelConnectorEmpty: {
    backgroundColor: colors.borderLight,
  },

  /* XP left text */
  xpLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  xpLeftText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },
  xpLeftValue: {
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },

  /* ═══ Statistics Card ═══ */
  statsCard: {
    marginBottom: spacing.lg,
  },

  /* XP Breakdown Row */
  xpBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  xpStatIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpStatText: {
    alignItems: 'flex-start',
  },
  xpStatValue: {
    fontSize: 15,
    fontFamily: fontFamily.headingBold,
    lineHeight: 18,
  },
  xpStatLabel: {
    fontSize: 10,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textDim,
  },
  xpDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.borderLight,
  },

  /* ═══ Section Headers ═══ */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  countChip: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countChipText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
});
