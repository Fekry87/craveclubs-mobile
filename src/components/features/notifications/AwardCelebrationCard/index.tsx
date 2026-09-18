import React, { useEffect, useMemo, useRef } from 'react';
import { Modal, View, Text, Animated, Dimensions } from 'react-native';
import { Button } from '../../../common/Button';
import { Icon } from '../../../common/Icon';
import { SwimmerAvatar } from '../../../common/SwimmerAvatar';
import { PendingAwardInterface } from '../../../../types/models.types';
import { AWARD_ICON, firstNameOf } from '../../../../utils/awards';
import { colors, ANIMATION } from '../../../../theme';
import { styles, AVATAR } from './styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/* ═══ Confetti — the WelcomeConfetti burst, re-armed for every award ═══ */
const CONFETTI_COUNT = 26;
const CONFETTI_COLORS = [
  colors.primary, colors.swimmer, colors.warning, colors.orange,
  colors.secondary, colors.pink, colors.teal, colors.white,
];

interface ConfettiDot {
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
}

const generateConfetti = (): ConfettiDot[] =>
  Array.from({ length: CONFETTI_COUNT }, () => ({
    x: Math.random() * SCREEN_WIDTH,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 6,
    delay: Math.random() * 500,
    duration: 1800 + Math.random() * 700,
    rotation: 360 + Math.random() * 360,
  }));

interface AwardCelebrationCardProps {
  visible: boolean;
  award: PendingAwardInterface | null;
  /** How many awards are still queued behind this one (0 = this is the last). */
  remaining: number;
  onDismiss: () => void;
}

/**
 * Club-wide celebration for Man of the Day / Week / Month.
 *
 * A centred card over a dimmed Home screen that needs an explicit "Bravo" to
 * close — no tap-outside dismiss, like `SessionSummaryPopup`. The whole
 * sequence re-runs for each award in the queue (keyed on the award id), so a
 * swimmer who missed a week sees each winner get their own moment.
 */
export const AwardCelebrationCard: React.FC<AwardCelebrationCardProps> = ({
  visible,
  award,
  remaining,
  onDismiss,
}) => {
  const awardId = award?.award_id ?? null;

  /* ─── Animated values (all at top level — rule 13) ─── */
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.8)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const trophyScale = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const xpScale = useRef(new Animated.Value(0.6)).current;
  const xpOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // A fresh burst per award: new positions, new timings.
  const confetti = useMemo(() => generateConfetti(), [awardId]); // eslint-disable-line react-hooks/exhaustive-deps
  const confettiAnims = useRef<Animated.Value[]>([]);
  if (confettiAnims.current.length !== CONFETTI_COUNT) {
    confettiAnims.current = confetti.map(() => new Animated.Value(0));
  }

  /* ─── Entry sequence, once per award ─── */
  useEffect(() => {
    if (!visible || awardId === null) return;

    overlayOpacity.setValue(0);
    cardScale.setValue(0.8);
    cardOpacity.setValue(0);
    trophyScale.setValue(0);
    avatarScale.setValue(0);
    textOpacity.setValue(0);
    xpScale.setValue(0.6);
    xpOpacity.setValue(0);
    buttonOpacity.setValue(0);
    confettiAnims.current.forEach((a) => a.setValue(0));

    const burst = Animated.parallel(
      confetti.map((dot, i) =>
        Animated.timing(confettiAnims.current[i], {
          toValue: 1,
          duration: dot.duration,
          delay: dot.delay,
          useNativeDriver: true,
        }),
      ),
    );

    const sequence = Animated.sequence([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: ANIMATION.duration.fast,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(trophyScale, {
          toValue: 1,
          tension: 80,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(avatarScale, {
          toValue: 1,
          tension: 50,
          friction: 6,
          delay: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: ANIMATION.duration.normal,
        easing: ANIMATION.easing.enter,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(xpScale, {
          toValue: 1,
          tension: 90,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(xpOpacity, {
          toValue: 1,
          duration: ANIMATION.duration.fast,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: ANIMATION.duration.normal,
        useNativeDriver: true,
      }),
    ]);

    sequence.start();
    // Confetti starts as the card lands, not before the overlay is up.
    const timer = setTimeout(() => burst.start(), 250);

    return () => {
      clearTimeout(timer);
      sequence.stop();
      burst.stop();
    };
  }, [
    visible, awardId, confetti,
    overlayOpacity, cardScale, cardOpacity, trophyScale, avatarScale,
    textOpacity, xpScale, xpOpacity, buttonOpacity,
  ]);

  if (!award) return null;

  const label = award.award_name;
  const firstName = firstNameOf(award.swimmer_name);
  const headline = award.is_mine ? `You're ${label}!` : `${label}!`;
  const subline = award.is_mine
    ? 'Your coach picked you. Keep it up!'
    : `${award.swimmer_name} — give them a hand`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      // Android back must not skip the celebration: only "Bravo" dismisses.
      onRequestClose={() => undefined}
    >
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        {/* ═══ Confetti ═══ */}
        <View style={styles.confettiLayer} pointerEvents="none">
          {confetti.map((dot, i) => {
            const anim = confettiAnims.current[i];
            const translateY = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, SCREEN_HEIGHT + 40],
            });
            const opacity = anim.interpolate({
              inputRange: [0, 0.1, 0.8, 1],
              outputRange: [0, 1, 1, 0],
            });
            const rotate = anim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', `${dot.rotation}deg`],
            });
            return (
              <Animated.View
                key={`${awardId}-${i}`}
                style={[
                  styles.confettiDot,
                  {
                    left: dot.x,
                    width: dot.size,
                    height: dot.size,
                    borderRadius: dot.size / 2,
                    backgroundColor: dot.color,
                    opacity,
                    transform: [{ translateY }, { rotate }],
                  },
                ]}
              />
            );
          })}
        </View>

        {/* ═══ Card ═══ */}
        <Animated.View
          style={[
            styles.card,
            { opacity: cardOpacity, transform: [{ scale: cardScale }] },
          ]}
          accessibilityViewIsModal
        >
          <Animated.View
            style={[styles.trophyBadge, { transform: [{ scale: trophyScale }] }]}
          >
            <Icon name="trophy-fill" size={30} color={colors.white} />
          </Animated.View>

          {remaining > 0 && (
            <Text style={styles.queueHint}>{remaining} more to celebrate</Text>
          )}

          <Animated.View
            style={[
              styles.avatarRing,
              { borderColor: colors.primary, transform: [{ scale: avatarScale }] },
            ]}
          >
            <SwimmerAvatar
              avatarUrl={award.swimmer_avatar_url}
              swimmerId={award.swimmer_id}
              size={AVATAR}
              fallback="character"
            />
          </Animated.View>

          <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
            <View style={styles.awardPill}>
              <Icon
                name={AWARD_ICON}
                size={14}
                color={colors.warningDark}
              />
              <Text style={styles.awardPillText}>
                {award.is_mine ? `${firstName}, that's you` : firstName}
              </Text>
            </View>
            <Text style={styles.headline} accessibilityRole="header">
              {headline}
            </Text>
            <Text style={styles.subline}>{subline}</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.xpRow,
              { opacity: xpOpacity, transform: [{ scale: xpScale }] },
            ]}
          >
            <Text style={[styles.xpValue, { color: colors.primary }]}>
              +{award.xp_value}
            </Text>
            <Text style={styles.xpSuffix}>XP</Text>
          </Animated.View>

          <Animated.View style={[styles.buttonWrap, { opacity: buttonOpacity }]}>
            <Button title="Bravo 👏" onPress={onDismiss} variant="primary" />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
