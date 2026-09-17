import React, { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { CoachOption } from '../../components/features/registration/TrainingOptions';
import { StepStatus } from '../../components/features/registration/StepStatus';
import { FieldError } from '../../components/features/registration/SectionLabel';
import { useRegistrationStore } from '../../store/registration.store';
import { getCoaches, getClubGroups, Coach, Group } from '../../api/services/registration.service';
import { coachesWithOpenGroups } from '../../utils/groupAvailability';
import { trainingTypeLabel } from '../../utils/trainingTypes';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step7_CoachSelection'
>;

// ── Main Screen ─────────────────────────────────────────────────
export const Step7_CoachSelection: React.FC<Props> = ({ navigation }) => {
  const { clubSlug, coachId, planTrainingType, setCoach, setStep } = useRegistrationStore();

  // ── State ─────────────────────────────────────────────────────
  // Only the coaches with an open group of the plan's type are offered: a
  // daily plan means a daily group, and a coach whose daily groups are all
  // full would only lead to an empty group step.
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
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


  // ── Fetch coaches + groups ────────────────────────────────────
  const fetchCoaches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [coachData, groupData] = await Promise.all([
        getCoaches(),
        clubSlug ? getClubGroups(clubSlug) : Promise.resolve([] as Group[]),
      ]);
      setCoaches(coachData);
      setGroups(groupData);
    } catch {
      setError('Failed to load coaches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [clubSlug]);

  // Refetch on focus, not only on mount: spots move, and the review screen
  // may have changed the plan (and so the type) meanwhile.
  useFocusEffect(
    useCallback(() => {
      fetchCoaches();
    }, [fetchCoaches]),
  );

  const available = useMemo(
    () => coachesWithOpenGroups(coaches, groups, planTrainingType),
    [coaches, groups, planTrainingType],
  );
  const typeLabel = trainingTypeLabel(planTrainingType).toLowerCase();

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
    const coach = available.find((c) => c.id === selectedId);
    if (!coach) {
      setValidationError('Please select a coach');
      return;
    }
    setCoach(coach.id, coach.name, coach.user_id ?? null);
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
      subtitle={planTrainingType ? `Coaches with an open ${typeLabel} group` : 'Who would you like to train with?'}
      onBack={onBack}
      ctaTitle={isLoading || error || available.length === 0 ? undefined : 'Continue'}
      onCtaPress={handleContinue}
    >
      {isLoading ? (
        <StepStatus kind="loading" message="Loading coaches…" />
      ) : error ? (
        <StepStatus kind="error" message={error} onRetry={fetchCoaches} />
      ) : available.length === 0 ? (
        <StepStatus
          kind="empty"
          icon="team-line"
          title={coaches.length === 0 ? 'No coaches yet' : `No open ${typeLabel} groups`}
          message={
            coaches.length === 0
              ? "This club hasn't added a coach. Please check with the club."
              : `Every coach's ${typeLabel} groups are full right now. Go back and choose a plan of another type, or check with the club.`
          }
        />
      ) : (
        available.map((item, index) => (
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
