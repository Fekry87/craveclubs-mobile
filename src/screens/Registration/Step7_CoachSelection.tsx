import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { SelectCard } from '../../components/features/registration/SelectCard';
import { StepStatus } from '../../components/features/registration/StepStatus';
import { FieldError } from '../../components/features/registration/SectionLabel';
import { Icon } from '../../components/common/Icon';
import { useRegistrationStore } from '../../store/registration.store';
import { getCoaches, Coach } from '../../api/services/registration.service';
import { colors, spacing, fontFamily, typography } from '../../theme';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step7_CoachSelection'
>;

const initialsOf = (name: string | null | undefined) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

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

  const onBack = () => {
    setStep(6);
    navigation.goBack();
  };

  return (
    <RegistrationLayout
      currentStep={7}
      title="Choose a coach"
      subtitle="Who would you like to train with?"
      onBack={onBack}
      ctaTitle={isLoading || error || coaches.length === 0 ? undefined : 'Continue'}
      onCtaPress={handleContinue}
    >
      {isLoading ? (
        <StepStatus kind="loading" message="Loading coaches…" />
      ) : error ? (
        <StepStatus kind="error" message={error} onRetry={fetchCoaches} />
      ) : coaches.length === 0 ? (
        <StepStatus
          kind="empty"
          icon="team-line"
          title="No coaches yet"
          message="This club hasn't added a coach. Please check with the club."
        />
      ) : (
        coaches.map((coach, index) => {
          const selected = selectedId === coach.id;
          return (
            <SelectCard
              key={coach.id}
              title={coach.name}
              subtitle={coach.specialization}
              selected={selected}
              onPress={() => handleSelect(coach)}
              index={index}
              leading={
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: selected ? colors.white : colors.surfaceLight },
                  ]}
                >
                  <Text style={[styles.avatarText, selected && { color: colors.primary }]}>
                    {initialsOf(coach.name)}
                  </Text>
                </View>
              }
            >
              {coach.experience_years != null && (
                <View style={styles.metaRow}>
                  <Icon name="award-line" size={14} color={colors.textMuted} />
                  <Text style={styles.metaText}>
                    {coach.experience_years} {coach.experience_years === 1 ? 'year' : 'years'} coaching
                  </Text>
                </View>
              )}
              {coach.bio ? (
                <Text style={styles.bio} numberOfLines={2}>
                  {coach.bio}
                </Text>
              ) : null}
            </SelectCard>
          );
        })
      )}

      <FieldError message={validationError} />
    </RegistrationLayout>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  bio: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
