import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { CoachOption } from '../../components/features/registration/TrainingOptions';
import { StepStatus } from '../../components/features/registration/StepStatus';
import { FieldError } from '../../components/features/registration/SectionLabel';
import { useRegistrationStore } from '../../store/registration.store';
import { getCoaches, Coach } from '../../api/services/registration.service';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step7_CoachSelection'
>;

// ── Main Screen ─────────────────────────────────────────────────
export const Step7_CoachSelection: React.FC<Props> = ({ navigation }) => {
  const { coachId, setCoach, setStep } = useRegistrationStore();

  // ── State ─────────────────────────────────────────────────────
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(coachId);

  // Reload on focus: the review screen may have changed this choice meanwhile.
  useFocusEffect(
    useCallback(() => {
      setSelectedId(useRegistrationStore.getState().coachId);
    }, []),
  );
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
      setCoach(coach.id, coach.name, coach.user_id ?? null);
    }
    setStep(8);
    navigation.navigate('Step7b_GroupSelection');
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
        coaches.map((item, index) => (
          <CoachOption
            key={item.id}
            item={item}
            selected={selectedId === item.id}
            onPress={() => handleSelect(item)}
            index={index}
          />
        ))
      )}

      <FieldError message={validationError} />
    </RegistrationLayout>
  );
};
