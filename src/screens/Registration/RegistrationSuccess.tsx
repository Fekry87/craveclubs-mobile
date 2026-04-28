import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  BackHandler,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, IconName } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useRegistrationStore } from '../../store/registration.store';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import {
  colors,
  spacing,
  typography,
  fontFamily,
  borderRadius,
} from '../../theme';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'RegistrationSuccess'
>;

// ── SummaryPill (inline) ─────────────────────────────────────────
function SummaryPill({
  icon,
  label,
  value,
  pillColor,
  index,
}: {
  icon: IconName;
  label: string;
  value: string;
  pillColor: string;
  index: number;
}) {
  const entry = useAnimatedEntry(index);

  return (
    <Animated.View
      style={[
        styles.pill,
        { backgroundColor: pillColor + '15', borderColor: pillColor + '30' },
        entry,
      ]}
    >
      <Icon name={icon} size={20} color={pillColor} />
      <View style={styles.pillTextCol}>
        <Text style={[styles.pillLabel, { color: pillColor }]}>{label}</Text>
        <Text style={styles.pillValue}>{value}</Text>
      </View>
    </Animated.View>
  );
}

export const RegistrationSuccess: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const resetRegistration = useRegistrationStore((s) => s.resetRegistration);
  const { swimmerName, branchName, coachName, planName } = route.params;

  // ── Spring animation for check icon ───────────────────────────
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  // ── Block hardware back button ────────────────────────────────
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true, // block back
    );
    return () => backHandler.remove();
  }, []);

  // ── Animations for content ────────────────────────────────────
  const titleEntry = useAnimatedEntry(0);
  const subtitleEntry = useAnimatedEntry(1);
  const buttonsEntry = useAnimatedEntry(6);

  // ── Handlers ──────────────────────────────────────────────────
  const handleGoHome = () => {
    resetRegistration();
    // Registration creates a pending record (no account yet).
    // Navigate back to login screen so user can log in once approved.
    const parent = navigation.getParent();
    if (parent?.canGoBack()) {
      parent.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* ── Animated check icon ───────────────────────────────── */}
        <Animated.View
          style={[
            styles.iconCircle,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Icon name="check-line" size={48} color={colors.white} />
        </Animated.View>

        {/* ── Title ─────────────────────────────────────────────── */}
        <Animated.View style={titleEntry}>
          <Text style={styles.title}>Registration Submitted!</Text>
        </Animated.View>

        {/* ── Subtitle ──────────────────────────────────────────── */}
        <Animated.View style={subtitleEntry}>
          <Text style={styles.subtitle}>
            Great job, {swimmerName}! Your registration has been submitted
            successfully. We'll review it and get back to you soon.
          </Text>
        </Animated.View>

        {/* ── Summary Pills ─────────────────────────────────────── */}
        <View style={styles.pillsContainer}>
          <SummaryPill
            icon="building-2-fill"
            label="Branch"
            value={branchName}
            pillColor={colors.primary}
            index={2}
          />
          <SummaryPill
            icon="user-settings-fill"
            label="Coach"
            value={coachName}
            pillColor={colors.secondary}
            index={3}
          />
          <SummaryPill
            icon="gift-fill"
            label="Plan"
            value={planName}
            pillColor={colors.swimmer}
            index={4}
          />
        </View>

        {/* ── Action Buttons ────────────────────────────────────── */}
        <Animated.View style={[styles.buttonsContainer, buttonsEntry]}>
          <Button
            title="Back to Login"
            onPress={handleGoHome}
            variant="primary"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.swimmer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },

  // ── Pills ─────────────────────────────────────────────────────
  pillsContainer: {
    width: '100%',
    gap: spacing.sm + 2,
    marginBottom: spacing.lg,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    gap: spacing.sm + 2,
  },
  pillTextCol: {
    flex: 1,
  },
  pillLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillValue: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
    marginTop: 2,
  },

  // ── Buttons ───────────────────────────────────────────────────
  buttonsContainer: {
    width: '100%',
    gap: spacing.sm,
  },
});
