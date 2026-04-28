import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { Button } from '../../components/common/Button'; // Used in error state
import { Icon } from '../../components/common/Icon';
import { useRegistrationStore } from '../../store/registration.store';
import { useAnimatedPress } from '../../hooks/useAnimatedPress';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { getCoaches, Coach } from '../../api/services/registration.service';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  fontFamily,
} from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step7_CoachSelection'
>;

// ── CoachCard (inline) ───────────────────────────────────────────
function CoachCard({
  coach,
  isSelected,
  onPress,
  index,
}: {
  coach: Coach;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}) {
  const entry = useAnimatedEntry(index);
  const press = useAnimatedPress();

  const initials = (coach.name || '??')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Animated.View style={entry}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.coachCard,
            isSelected
              ? styles.coachCardSelected
              : styles.coachCardUnselected,
            press.animatedStyle,
          ]}
        >
          {/* Avatar */}
          <LinearGradient
            colors={
              isSelected
                ? ([colors.primary, colors.secondary] as const)
                : ([colors.border, colors.textDim] as const)
            }
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>

          {/* Info */}
          <View style={styles.coachTextCol}>
            <Text
              style={[
                styles.coachName,
                isSelected && styles.coachNameSelected,
              ]}
            >
              {coach.name}
            </Text>
            {coach.specialization && (
              <Text
                style={[
                  styles.coachSpec,
                  isSelected && styles.coachSpecSelected,
                ]}
                numberOfLines={1}
              >
                {coach.specialization}
              </Text>
            )}
            <View style={styles.metaRow}>
              {coach.experience_years != null && (
                <View style={styles.metaItem}>
                  <Icon
                    name="award-fill"
                    size={12}
                    color={
                      isSelected ? colors.primaryDark : colors.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.metaText,
                      isSelected && { color: colors.primaryDark },
                    ]}
                  >
                    {coach.experience_years}yr exp
                  </Text>
                </View>
              )}
            </View>
            {coach.bio && (
              <Text style={styles.coachBio} numberOfLines={2}>
                {coach.bio}
              </Text>
            )}
          </View>

          {/* Checkmark */}
          {isSelected && (
            <View style={styles.checkmark}>
              <Icon
                name="checkbox-circle-fill"
                size={22}
                color={colors.primary}
              />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main Screen ─────────────────────────────────────────────────
export const Step7_CoachSelection: React.FC<Props> = ({ navigation }) => {
  const { coachId, setCoach, setStep } = useRegistrationStore();

  // ── State ─────────────────────────────────────────────────────
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(coachId);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);


  // ── Fetch coaches ─────────────────────────────────────────────
  const fetchCoaches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCoaches();
      setCoaches(data);
    } catch {
      setError('Failed to load coaches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleSelect = (coach: Coach) => {
    setSelectedId(coach.id);
    if (validationError) setValidationError(null);
  };

  const handleContinue = () => {
    if (!selectedId) {
      setValidationError('Please select a coach');
      return;
    }
    const coach = coaches.find((c) => c.id === selectedId);
    if (coach) {
      setCoach(coach.id, coach.name);
    }
    setStep(8);
    navigation.navigate('Step8_ReviewPayment');
  };

  // ── Loading state ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <RegistrationLayout
        currentStep={7}
        title="Choose Coach"
        subtitle="Select your preferred coach"
        onBack={() => {
          setStep(6);
          navigation.goBack();
        }}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading coaches...</Text>
        </View>
      </RegistrationLayout>
    );
  }

  // ── Error state ───────────────────────────────────────────────
  if (error) {
    return (
      <RegistrationLayout
        currentStep={7}
        title="Choose Coach"
        subtitle="Select your preferred coach"
        onBack={() => {
          setStep(6);
          navigation.goBack();
        }}
      >
        <View style={styles.centerContainer}>
          <Icon name="error-warning-fill" size={48} color={colors.error} />
          <Text style={styles.errorMessage}>{error}</Text>
          <Button title="Try Again" onPress={fetchCoaches} variant="blue" />
        </View>
      </RegistrationLayout>
    );
  }

  return (
    <RegistrationLayout
      currentStep={7}
      title="Choose Coach"
      subtitle="Select your preferred coach"
      onBack={() => {
        setStep(6);
        navigation.goBack();
      }}
      ctaTitle="Continue"
      onCtaPress={handleContinue}
    >
      {/* Coach cards */}
      {coaches.map((coach, index) => (
        <CoachCard
          key={coach.id}
          coach={coach}
          isSelected={selectedId === coach.id}
          onPress={() => handleSelect(coach)}
          index={index}
        />
      ))}

      {/* Empty state */}
      {coaches.length === 0 && (
        <View style={styles.centerContainer}>
          <Icon name="team-fill" size={48} color={colors.textDim} />
          <Text style={styles.emptyText}>No coaches available</Text>
        </View>
      )}

      {/* Validation error */}
      {validationError && (
        <Text style={styles.validationError}>{validationError}</Text>
      )}

    </RegistrationLayout>
  );
};

const styles = StyleSheet.create({
  // ── Coach Card ────────────────────────────────────────────────
  coachCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
  },
  coachCardUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  coachCardSelected: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 17,
    fontFamily: fontFamily.headingBold,
    color: colors.white,
  },
  coachTextCol: {
    flex: 1,
    marginLeft: spacing.sm + 2,
  },
  coachName: {
    ...typography.bodyMedium,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  coachNameSelected: {
    color: colors.primary,
  },
  coachSpec: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  coachSpecSelected: {
    color: colors.primaryDark,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  coachBio: {
    ...typography.caption,
    color: colors.textDim,
    marginTop: 4,
    lineHeight: 16,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },

  // ── States ────────────────────────────────────────────────────
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
  },
  errorMessage: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },

  // ── Validation ────────────────────────────────────────────────
  validationError: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

});
