import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, BackHandler, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { InfoRow } from '../../components/common/InfoRow';
import { useRegistrationStore } from '../../store/registration.store';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { colors, spacing, typography, fontFamily } from '../../theme';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'RegistrationSuccess'
>;

const NEXT_STEPS = [
  'The club reviews your registration',
  'Once it is approved, the club gives you your login details',
  'Sign in with your phone number and start training',
];

export const RegistrationSuccess: React.FC<Props> = ({ navigation, route }) => {
  const resetRegistration = useRegistrationStore((s) => s.resetRegistration);
  const clubName = useRegistrationStore((s) => s.clubName);
  const { swimmerName, branchName, coachName, planName } = route.params;
  const firstName = swimmerName.trim().split(/\s+/)[0] || swimmerName;

  // ── Spring animation for the check ─────────────────────────────
  const scaleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  // ── Block hardware back: the registration is already sent ──────
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  const titleEntry = useAnimatedEntry(0);
  const summaryEntry = useAnimatedEntry(2);
  const stepsEntry = useAnimatedEntry(3);
  const buttonEntry = useAnimatedEntry(4);

  const handleDone = () => {
    resetRegistration();
    // Registration creates a pending record (no account yet), so this goes back
    // to the sign-in screen for when the club approves it.
    const parent = navigation.getParent();
    if (parent?.canGoBack()) {
      parent.goBack();
    }
  };

  const club = clubName || 'The club';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.check,
            { backgroundColor: colors.success, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Icon name="check-line" size={44} color={colors.white} />
        </Animated.View>

        <Animated.View style={titleEntry}>
          <Text style={styles.title} accessibilityRole="header">
            Registration sent
          </Text>
          <Text style={styles.subtitle}>
            Thanks, {firstName}. {club} will review your registration.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.block, summaryEntry]}>
          <Card>
            <InfoRow icon="building-2-line" label="Branch" value={branchName || '—'} />
            <InfoRow icon="user-star-line" label="Coach" value={coachName || '—'} />
            <InfoRow icon="gift-line" label="Plan" value={planName || '—'} isLast />
          </Card>
        </Animated.View>

        <Animated.View style={[styles.block, stepsEntry]}>
          <Text style={styles.nextTitle}>What happens next</Text>
          <Card>
            {NEXT_STEPS.map((text, i) => (
              <View
                key={text}
                style={[styles.nextRow, i < NEXT_STEPS.length - 1 && styles.nextRowDivider]}
              >
                <View style={[styles.nextNumber, { backgroundColor: colors.primaryDim }]}>
                  <Text style={[styles.nextNumberText, { color: colors.primary }]}>{i + 1}</Text>
                </View>
                <Text style={styles.nextText}>{text}</Text>
              </View>
            ))}
          </Card>
        </Animated.View>
      </ScrollView>

      <Animated.View style={[styles.footer, buttonEntry]}>
        <Button title="Back to sign in" onPress={handleDone} variant="primary" />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  check: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  block: {
    marginTop: spacing.lg,
  },
  nextTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  nextRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  nextNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextNumberText: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
  },
  nextText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
});
