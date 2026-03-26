import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../../common/Button';
import { Icon } from '../../../common/Icon';
import { CircularProgress } from '../../../common/CircularProgress';
import { LevelCharacter } from '../../leaderboard/LevelCharacter';
import {
  DashboardResponseType,
  LeaderboardResponseType,
} from '../../../../types/api.types';
import { TrainingSessionInterface } from '../../../../types/models.types';
import { formatRating, formatPercentage } from '../../../../utils/formatters';
import { colors, spacing, gradients, ANIMATION } from '../../../../theme';
import { styles } from './styles';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

/* ═══ Confetti Config ═══ */
const CONFETTI_COLORS = [
  colors.primary, colors.swimmer, colors.warning,
  colors.secondary, colors.orange, colors.pink,
  colors.white,
];
const CONFETTI_COUNT = 24;

interface ConfettiPiece {
  x: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  swing: number;
}

const generateConfetti = (): ConfettiPiece[] =>
  Array.from({ length: CONFETTI_COUNT }, () => ({
    x: Math.random() * SCREEN_WIDTH,
    size: 4 + Math.random() * 5,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 2000,
    duration: 2500 + Math.random() * 2000,
    swing: (Math.random() - 0.5) * 40,
  }));

/* ═══ Sparkle positions around the character ═══ */
const SPARKLE_CONFIGS = [
  { top: -20, left: -24, size: 24, color: colors.warning },
  { top: -16, right: -28, size: 20, color: colors.white },
  { top: 72, left: -32, size: 18, color: colors.orange },
  { top: 80, right: -22, size: 22, color: colors.warning },
];

interface SessionSummaryPopupProps {
  visible: boolean;
  onDismiss: () => void;
  session: TrainingSessionInterface | null;
  dashboard: DashboardResponseType | null;
  leaderboard: LeaderboardResponseType | null;
}

export const SessionSummaryPopup: React.FC<SessionSummaryPopupProps> = ({
  visible,
  onDismiss,
  session,
  dashboard,
  leaderboard,
}) => {
  /* ─── Confetti pieces (stable across re-renders) ─── */
  const confettiPieces = useMemo(() => generateConfetti(), []);

  /* ─── Animated values (all at top level — rule 13) ─── */
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const characterScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const xpCounter = useRef(new Animated.Value(0)).current;

  // Session card
  const sessionCardOpacity = useRef(new Animated.Value(0)).current;
  const sessionCardTransY = useRef(new Animated.Value(20)).current;

  // XP card
  const xpCardOpacity = useRef(new Animated.Value(0)).current;
  const xpCardTransY = useRef(new Animated.Value(20)).current;

  // XP breakdown items (3)
  const xpItemOpacity0 = useRef(new Animated.Value(0)).current;
  const xpItemTransY0 = useRef(new Animated.Value(20)).current;
  const xpItemOpacity1 = useRef(new Animated.Value(0)).current;
  const xpItemTransY1 = useRef(new Animated.Value(20)).current;
  const xpItemOpacity2 = useRef(new Animated.Value(0)).current;
  const xpItemTransY2 = useRef(new Animated.Value(20)).current;

  // Stats grid items (4)
  const statOpacity0 = useRef(new Animated.Value(0)).current;
  const statTransY0 = useRef(new Animated.Value(20)).current;
  const statOpacity1 = useRef(new Animated.Value(0)).current;
  const statTransY1 = useRef(new Animated.Value(20)).current;
  const statOpacity2 = useRef(new Animated.Value(0)).current;
  const statTransY2 = useRef(new Animated.Value(20)).current;
  const statOpacity3 = useRef(new Animated.Value(0)).current;
  const statTransY3 = useRef(new Animated.Value(20)).current;

  // Sparkles (4)
  const sparkleScale0 = useRef(new Animated.Value(0)).current;
  const sparkleScale1 = useRef(new Animated.Value(0)).current;
  const sparkleScale2 = useRef(new Animated.Value(0)).current;
  const sparkleScale3 = useRef(new Animated.Value(0)).current;

  // Confetti (each piece has its own translateY)
  const confettiAnims = useRef(
    confettiPieces.map(() => new Animated.Value(-20)),
  ).current;
  const confettiOpacities = useRef(
    confettiPieces.map(() => new Animated.Value(0)),
  ).current;

  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  const [displayXp, setDisplayXp] = useState(0);

  /* ─── XP counter listener ─── */
  useEffect(() => {
    const id = xpCounter.addListener(({ value }) => {
      setDisplayXp(Math.round(value));
    });
    return () => xpCounter.removeListener(id);
  }, [xpCounter]);

  /* ─── Confetti loop ─── */
  useEffect(() => {
    if (!visible) return;

    const animations = confettiPieces.map((piece, i) => {
      const startConfetti = () => {
        confettiAnims[i].setValue(-20);
        confettiOpacities[i].setValue(0.8);

        Animated.parallel([
          Animated.timing(confettiAnims[i], {
            toValue: SCREEN_HEIGHT + 20,
            duration: piece.duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(piece.duration * 0.7),
            Animated.timing(confettiOpacities[i], {
              toValue: 0,
              duration: piece.duration * 0.3,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          if (visible) startConfetti();
        });
      };

      // Stagger confetti start
      const timeout = setTimeout(startConfetti, piece.delay);
      return timeout;
    });

    return () => {
      animations.forEach(clearTimeout);
      confettiAnims.forEach((a) => a.setValue(-20));
      confettiOpacities.forEach((a) => a.setValue(0));
    };
  }, [visible, confettiPieces, confettiAnims, confettiOpacities]);

  /* ─── Main animation orchestration ─── */
  useEffect(() => {
    if (!visible || !leaderboard) return;

    // Reset all
    const allOpacities = [
      overlayOpacity, titleOpacity,
      sessionCardOpacity, xpCardOpacity,
      xpItemOpacity0, xpItemOpacity1, xpItemOpacity2,
      statOpacity0, statOpacity1, statOpacity2, statOpacity3,
      buttonsOpacity,
    ];
    const allTranslateYs = [
      sessionCardTransY, xpCardTransY,
      xpItemTransY0, xpItemTransY1, xpItemTransY2,
      statTransY0, statTransY1, statTransY2, statTransY3,
    ];
    allOpacities.forEach((v) => v.setValue(0));
    allTranslateYs.forEach((v) => v.setValue(20));
    characterScale.setValue(0);
    xpCounter.setValue(0);
    sparkleScale0.setValue(0);
    sparkleScale1.setValue(0);
    sparkleScale2.setValue(0);
    sparkleScale3.setValue(0);

    const staggerItem = (opacity: Animated.Value, transY: Animated.Value) =>
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION.duration.normal,
          easing: ANIMATION.easing.enter,
          useNativeDriver: true,
        }),
        Animated.timing(transY, {
          toValue: 0,
          duration: ANIMATION.duration.normal,
          easing: ANIMATION.easing.enter,
          useNativeDriver: true,
        }),
      ]);

    const sparkleAnim = (scale: Animated.Value) =>
      Animated.spring(scale, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      });

    Animated.sequence([
      // Phase 1: Full-screen fade in
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // Phase 2: Character spring + sparkles
      Animated.parallel([
        Animated.spring(characterScale, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.stagger(100, [
          sparkleAnim(sparkleScale0),
          sparkleAnim(sparkleScale1),
          sparkleAnim(sparkleScale2),
          sparkleAnim(sparkleScale3),
        ]),
      ]),
      // Phase 3: Title + session name
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: ANIMATION.duration.normal,
        useNativeDriver: true,
      }),
      // Phase 4: Session card slide up
      staggerItem(sessionCardOpacity, sessionCardTransY),
      // Phase 5: XP card slide up
      staggerItem(xpCardOpacity, xpCardTransY),
      // Phase 6: XP counter (runs on JS thread)
      Animated.timing(xpCounter, {
        toValue: leaderboard.my_xp.total_xp,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      // Phase 7: XP breakdown stagger
      Animated.stagger(ANIMATION.duration.stagger, [
        staggerItem(xpItemOpacity0, xpItemTransY0),
        staggerItem(xpItemOpacity1, xpItemTransY1),
        staggerItem(xpItemOpacity2, xpItemTransY2),
      ]),
      // Phase 8: Stats stagger
      Animated.stagger(ANIMATION.duration.stagger, [
        staggerItem(statOpacity0, statTransY0),
        staggerItem(statOpacity1, statTransY1),
        staggerItem(statOpacity2, statTransY2),
        staggerItem(statOpacity3, statTransY3),
      ]),
      // Phase 9: Button
      Animated.timing(buttonsOpacity, {
        toValue: 1,
        duration: ANIMATION.duration.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    visible, leaderboard,
    overlayOpacity, characterScale, titleOpacity,
    sessionCardOpacity, sessionCardTransY, xpCardOpacity, xpCardTransY,
    xpCounter, xpItemOpacity0, xpItemTransY0, xpItemOpacity1, xpItemTransY1,
    xpItemOpacity2, xpItemTransY2, statOpacity0, statTransY0, statOpacity1,
    statTransY1, statOpacity2, statTransY2, statOpacity3, statTransY3,
    sparkleScale0, sparkleScale1, sparkleScale2, sparkleScale3, buttonsOpacity,
  ]);

  if (!dashboard || !leaderboard) return null;

  /* ─── Session-specific data ─── */
  const attended = session?.attendances?.some((a) => a.present);
  const sessionEval = session
    ? dashboard.recent_evaluations.find(
        (e) => e.session?.id === session.id,
      )
    : null;

  // Calculate session duration in minutes
  let durationMin = 0;
  if (session?.start_time && session?.end_time) {
    const [sh, sm] = session.start_time.split(':').map(Number);
    const [eh, em] = session.end_time.split(':').map(Number);
    durationMin = (eh * 60 + em) - (sh * 60 + sm);
    if (durationMin < 0) durationMin += 24 * 60;
  }

  const xpBreakdown = [
    {
      icon: 'star-fill' as const,
      value: leaderboard.my_xp.rating_xp,
      label: 'Rating',
      color: colors.warning,
      opacity: xpItemOpacity0,
      transY: xpItemTransY0,
    },
    {
      icon: 'check-line' as const,
      value: leaderboard.my_xp.attendance_xp,
      label: 'Attendance',
      color: colors.swimmer,
      opacity: xpItemOpacity1,
      transY: xpItemTransY1,
    },
    {
      icon: 'fire-fill' as const,
      value: leaderboard.my_xp.streak_xp,
      label: 'Streak',
      color: colors.orange,
      opacity: xpItemOpacity2,
      transY: xpItemTransY2,
    },
  ];

  const statsCells = [
    {
      icon: 'star-fill' as const,
      value: formatRating(dashboard.average_rating),
      label: 'Avg Rating',
      color: colors.warning,
      dimColor: colors.warningDim,
      opacity: statOpacity0,
      transY: statTransY0,
    },
    {
      icon: 'percent-line' as const,
      value: formatPercentage(dashboard.attendance_rate),
      label: 'Attendance',
      color: colors.primary,
      dimColor: colors.primaryDim,
      opacity: statOpacity1,
      transY: statTransY1,
    },
    {
      icon: 'award-fill' as const,
      value: dashboard.sessions_attended.toString(),
      label: 'Sessions',
      color: colors.swimmer,
      dimColor: colors.swimmerDim,
      opacity: statOpacity2,
      transY: statTransY2,
    },
  ];

  const sparkleScales = [sparkleScale0, sparkleScale1, sparkleScale2, sparkleScale3];
  const rawProgress = leaderboard.my_level.progress ?? 0;
  const levelProgress = Math.round(rawProgress > 1 ? rawProgress : rawProgress * 100);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        {/* ═══ Confetti Particles ═══ */}
        {confettiPieces.map((piece, i) => (
          <Animated.View
            key={i}
            style={[
              styles.confettiParticle,
              {
                left: piece.x,
                width: piece.size,
                height: piece.size,
                borderRadius: piece.size / 2,
                backgroundColor: piece.color,
                opacity: confettiOpacities[i],
                transform: [
                  { translateY: confettiAnims[i] },
                  { translateX: piece.swing },
                ],
              },
            ]}
          />
        ))}

        {/* ═══ Close Button (above everything) ═══ */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onDismiss}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="close-line" size={22} color={colors.white} />
        </TouchableOpacity>

        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          {/* ═══ Gradient Header (full-width) ═══ */}
          <LinearGradient
            colors={[...gradients.splash]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            {/* Character + Sparkles */}
            <Animated.View
              style={[
                styles.characterContainer,
                { transform: [{ scale: characterScale }] },
              ]}
            >
              <View style={styles.sparkleContainer}>
                {SPARKLE_CONFIGS.map((cfg, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.sparkle,
                      {
                        top: cfg.top,
                        left: 'left' in cfg ? cfg.left : undefined,
                        right: 'right' in cfg ? cfg.right : undefined,
                        transform: [{ scale: sparkleScales[i] }],
                      },
                    ]}
                  >
                    <Icon
                      name="sparkling-2-fill"
                      size={cfg.size}
                      color={cfg.color}
                    />
                  </Animated.View>
                ))}
              </View>
              <LevelCharacter
                levelName={leaderboard.my_level.name}
                size={140}
              />
            </Animated.View>

            {/* Level Badge */}
            <View
              style={[
                styles.levelBadge,
                { backgroundColor: leaderboard.my_level.color },
              ]}
            >
              <Text style={styles.levelBadgeText}>
                {leaderboard.my_level.name}
              </Text>
            </View>

            {/* Title + Session Name */}
            <Animated.View style={{ opacity: titleOpacity }}>
              <Text style={styles.celebrationTitle}>
                Session Complete!
              </Text>
              <Text style={styles.sessionName}>
                {session?.title || session?.type || 'Training Session'}
              </Text>
            </Animated.View>
          </LinearGradient>

          {/* ═══ White Body ═══ */}
          <View style={styles.body}>
            {/* ── This Session ── */}
            {session && (
              <>
                <Text style={styles.sectionLabel}>THIS SESSION</Text>
                <Animated.View
                  style={[
                    styles.sessionCard,
                    {
                      opacity: sessionCardOpacity,
                      transform: [{ translateY: sessionCardTransY }],
                    },
                  ]}
                >
                  {/* Attended */}
                  <View style={styles.sessionStatItem}>
                    <View
                      style={[
                        styles.sessionStatIconBox,
                        {
                          backgroundColor: attended
                            ? colors.successDim
                            : colors.errorDim,
                        },
                      ]}
                    >
                      <Icon
                        name={attended ? 'check-line' : 'close-line'}
                        size={20}
                        color={attended ? colors.success : colors.error}
                      />
                    </View>
                    <Text style={styles.sessionStatValue}>
                      {attended ? 'Present' : 'Absent'}
                    </Text>
                    <Text style={styles.sessionStatLabel}>Attendance</Text>
                  </View>

                  {/* Duration */}
                  {durationMin > 0 && (
                    <View style={styles.sessionStatItem}>
                      <View
                        style={[
                          styles.sessionStatIconBox,
                          { backgroundColor: colors.primaryDim },
                        ]}
                      >
                        <Icon
                          name="time-line"
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                      <Text style={styles.sessionStatValue}>
                        {durationMin} min
                      </Text>
                      <Text style={styles.sessionStatLabel}>Duration</Text>
                    </View>
                  )}

                  {/* Rating */}
                  {sessionEval && (
                    <View style={styles.sessionStatItem}>
                      <View
                        style={[
                          styles.sessionStatIconBox,
                          { backgroundColor: colors.warningDim },
                        ]}
                      >
                        <Icon
                          name="star-fill"
                          size={20}
                          color={colors.warning}
                        />
                      </View>
                      <Text style={styles.sessionStatValue}>
                        {sessionEval.rating}.0
                      </Text>
                      <Text style={styles.sessionStatLabel}>Rating</Text>
                    </View>
                  )}

                  {/* Session Type */}
                  <View style={styles.sessionStatItem}>
                    <View
                      style={[
                        styles.sessionStatIconBox,
                        { backgroundColor: colors.secondaryDim },
                      ]}
                    >
                      <Icon
                        name="drop-fill"
                        size={20}
                        color={colors.secondary}
                      />
                    </View>
                    <Text
                      style={styles.sessionStatValue}
                      numberOfLines={1}
                    >
                      {session.type}
                    </Text>
                    <Text style={styles.sessionStatLabel}>Type</Text>
                  </View>
                </Animated.View>
              </>
            )}

            {/* ── XP Card (unified) ── */}
            <Animated.View
              style={[
                styles.xpCard,
                {
                  opacity: xpCardOpacity,
                  transform: [{ translateY: xpCardTransY }],
                },
              ]}
            >
              <View style={styles.xpSection}>
                <Text style={styles.xpTotalLabel}>TOTAL XP</Text>
                <Text style={styles.xpTotalValue}>
                  {displayXp.toLocaleString()}
                </Text>
              </View>

              <View style={styles.xpBreakdownRow}>
                {xpBreakdown.map((item) => (
                  <Animated.View
                    key={item.label}
                    style={[
                      styles.xpBreakdownItem,
                      {
                        opacity: item.opacity,
                        transform: [{ translateY: item.transY }],
                      },
                    ]}
                  >
                    <View style={styles.xpBreakdownIcon}>
                      <Icon name={item.icon} size={20} color={item.color} />
                    </View>
                    <Text
                      style={[styles.xpBreakdownValue, { color: item.color }]}
                    >
                      {item.value}
                    </Text>
                    <Text style={styles.xpBreakdownLabel}>{item.label}</Text>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>

            {/* ── Your Stats ── */}
            <Text style={styles.sectionLabel}>YOUR STATS</Text>
            <View style={styles.statsGrid}>
              {statsCells.map((cell) => (
                <Animated.View
                  key={cell.label}
                  style={[
                    styles.statsCell,
                    {
                      opacity: cell.opacity,
                      transform: [{ translateY: cell.transY }],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statsCellIconBox,
                      { backgroundColor: cell.dimColor },
                    ]}
                  >
                    <Icon name={cell.icon} size={20} color={cell.color} />
                  </View>
                  <Text style={[styles.statsCellValue, { color: cell.color }]}>
                    {cell.value}
                  </Text>
                  <Text style={styles.statsCellLabel}>{cell.label}</Text>
                </Animated.View>
              ))}

              {/* Level Progress — 4th cell */}
              <Animated.View
                style={[
                  styles.statsCell,
                  {
                    opacity: statOpacity3,
                    transform: [{ translateY: statTransY3 }],
                  },
                ]}
              >
                <CircularProgress
                  percent={levelProgress}
                  size={48}
                  strokeWidth={5}
                  progressColor={leaderboard.my_level.color}
                  trackColor={colors.borderLight}
                >
                  <Text
                    style={[
                      styles.statsCellValue,
                      {
                        color: leaderboard.my_level.color,
                        fontSize: 14,
                      },
                    ]}
                  >
                    {levelProgress}%
                  </Text>
                </CircularProgress>
                <Text style={[styles.statsCellLabel, { marginTop: spacing.sm }]}>
                  Level Progress
                </Text>
              </Animated.View>
            </View>

          </View>
        </ScrollView>

        {/* ═══ Sticky Bottom Button ═══ */}
        <Animated.View
          style={[styles.buttonContainer, { opacity: buttonsOpacity }]}
        >
          <Button title="Awesome!" onPress={onDismiss} variant="primary" />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
