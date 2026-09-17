import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { GroupOption } from '../../components/features/registration/TrainingOptions';
import { TrainingTypeTabs } from '../../components/features/registration/TrainingTypeTabs';
import { StepStatus } from '../../components/features/registration/StepStatus';
import { FieldError } from '../../components/features/registration/SectionLabel';
import { useRegistrationStore } from '../../store/registration.store';
import { getGroups, Group } from '../../api/services/registration.service';
import { trainingTypesIn } from '../../utils/trainingTypes';
import { groupSchedule } from '../../utils/formatters';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step7b_GroupSelection'
>;

/**
 * Step 7b — the chosen coach's groups, one tab per training type, each with
 * its schedule and the spots left. Opens on the tab of the plan's type, since
 * that is the kind of group the swimmer is paying for.
 */
export const Step7b_GroupSelection: React.FC<Props> = ({ navigation }) => {
  const { clubSlug, coachId, coachName, coachUserId, groupId, planTrainingType, setGroup, setStep } =
    useRegistrationStore();

  // ── State ─────────────────────────────────────────────────────
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(groupId);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const types = useMemo(
    () => trainingTypesIn(groups.map((g) => ({ ...g, training_type: g.group_type }))),
    [groups],
  );
  const visible = groups.filter((g) => g.group_type === activeType);

  // ── Fetch groups ──────────────────────────────────────────────
  const fetchGroups = useCallback(async () => {
    if (!clubSlug || !coachId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getGroups(clubSlug, { user_id: coachUserId ?? undefined, name: coachName ?? '' });
      setGroups(data);
      setActiveType((current) => {
        const present = trainingTypesIn(data.map((g) => ({ ...g, training_type: g.group_type })));
        const chosenType = data.find((g) => g.id === useRegistrationStore.getState().groupId)?.group_type;
        const preferred = chosenType ?? current ?? planTrainingType;
        return preferred && present.includes(preferred) ? preferred : (present[0] ?? null);
      });
    } catch {
      setError('Failed to load groups. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [clubSlug, coachId, coachUserId, coachName, planTrainingType]);

  // Refetch on every focus, not just on mount: coming back here after "this
  // group has just filled up" must show the spots as they are now, and the
  // review screen may have changed the coach meanwhile.
  useFocusEffect(
    useCallback(() => {
      setSelectedId(useRegistrationStore.getState().groupId);
      fetchGroups();
    }, [fetchGroups]),
  );

  // Drop a selection that is no longer offered (the group filled up or went).
  useEffect(() => {
    if (selectedId && !groups.some((g) => g.id === selectedId && !g.is_full)) {
      setSelectedId(null);
    }
  }, [groups, selectedId]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleSelect = (group: Group) => {
    if (group.is_full) return;
    setSelectedId(group.id);
    if (validationError) setValidationError(null);
  };

  const handleContinue = () => {
    const group = groups.find((g) => g.id === selectedId);
    if (!group) {
      setValidationError('Please select a group');
      return;
    }
    setGroup(group.id, group.name, group.group_type, groupSchedule(group) || null);
    setStep(9);
    navigation.navigate('Step8_ReviewPayment');
  };

  const onBack = () => {
    setStep(7);
    navigation.goBack();
  };

  return (
    <RegistrationLayout
      currentStep={8}
      title="Choose a group"
      subtitle={coachName ? `${coachName}'s groups — pick the schedule that suits you` : 'Pick the schedule that suits you'}
      onBack={onBack}
      ctaTitle={isLoading || error || groups.length === 0 ? undefined : 'Continue'}
      onCtaPress={handleContinue}
    >
      {isLoading ? (
        <StepStatus kind="loading" message="Loading groups…" />
      ) : error ? (
        <StepStatus kind="error" message={error} onRetry={fetchGroups} />
      ) : groups.length === 0 ? (
        <StepStatus
          kind="empty"
          icon="group-line"
          title="No groups yet"
          message="This coach has no groups open for registration yet. Go back and choose another coach, or check with the club."
        />
      ) : (
        <>
          <TrainingTypeTabs types={types} active={activeType} onChange={setActiveType} />
          {visible.map((item, index) => (
            <GroupOption
              key={item.id}
              item={item}
              selected={selectedId === item.id}
              onPress={() => handleSelect(item)}
              index={index}
            />
          ))}
        </>
      )}

      <FieldError message={validationError} />
    </RegistrationLayout>
  );
};
