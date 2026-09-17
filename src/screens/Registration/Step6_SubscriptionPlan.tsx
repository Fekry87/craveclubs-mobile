import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { PlanPicker } from '../../components/features/registration/PlanPicker';
import { StepStatus } from '../../components/features/registration/StepStatus';
import { FieldError } from '../../components/features/registration/SectionLabel';
import { useRegistrationStore } from '../../store/registration.store';
import {
  getClubGroups,
  getSubscriptionPlans,
  Group,
  SubscriptionPlan,
} from '../../api/services/registration.service';
import { planPrice } from '../../utils/formatters';
import { trainingTypeLabel, trainingTypesIn } from '../../utils/trainingTypes';
import { typesWithOpenGroups } from '../../utils/groupAvailability';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step6_SubscriptionPlan'
>;

// ── Main Screen ─────────────────────────────────────────────────
export const Step6_SubscriptionPlan: React.FC<Props> = ({ navigation }) => {
  const { clubSlug, planId, setPlan, setStep } = useRegistrationStore();

  // ── State ─────────────────────────────────────────────────────
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  // The club's groups: a plan's type is only worth choosing if a coach still
  // has an open group of that type, so the swimmer learns it here rather than
  // at the coach step, empty-handed.
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(planId);

  // Reload on focus: the review screen may have changed this choice meanwhile.
  useFocusEffect(
    useCallback(() => {
      setSelectedId(useRegistrationStore.getState().planId);
    }, []),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);


  // ── Fetch plans + groups ──────────────────────────────────────
  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [planData, groupData] = await Promise.all([
        getSubscriptionPlans(),
        clubSlug ? getClubGroups(clubSlug) : Promise.resolve([] as Group[]),
      ]);
      setPlans(planData);
      setGroups(groupData);
    } catch {
      setError('Failed to load plans. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [clubSlug]);

  // Types the club sells plans in but has no open group for.
  const unavailableTypes = useMemo(() => {
    const open = typesWithOpenGroups(groups);
    return new Set(trainingTypesIn(plans).filter((t) => !open.has(t)));
  }, [plans, groups]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleSelect = (plan: SubscriptionPlan) => {
    if (unavailableTypes.has(plan.training_type)) return;
    setSelectedId(plan.id);
    if (validationError) setValidationError(null);
  };

  const handleContinue = () => {
    const plan = plans.find((p) => p.id === selectedId);
    if (!plan) {
      setValidationError('Please select a subscription plan');
      return;
    }
    // The groups may have filled since the plan was chosen (an edit, a return).
    if (unavailableTypes.has(plan.training_type)) {
      setValidationError(
        `All ${trainingTypeLabel(plan.training_type).toLowerCase()} groups are full right now. Choose a plan of another type.`,
      );
      return;
    }
    setPlan(plan.id, plan.name, planPrice(plan), plan.training_type);
    setStep(7);
    navigation.navigate('Step7_CoachSelection');
  };

  const onBack = () => {
    setStep(5);
    navigation.goBack();
  };

  return (
    <RegistrationLayout
      currentStep={6}
      title="Choose a plan"
      subtitle="Pick how often you train, then a plan"
      onBack={onBack}
      ctaTitle={isLoading || error || plans.length === 0 ? undefined : 'Continue'}
      onCtaPress={handleContinue}
    >
      {isLoading ? (
        <StepStatus kind="loading" message="Loading plans…" />
      ) : error ? (
        <StepStatus kind="error" message={error} onRetry={fetchPlans} />
      ) : plans.length === 0 ? (
        <StepStatus
          kind="empty"
          icon="gift-line"
          title="No plans yet"
          message="This club hasn't published a plan. Please check with the club."
        />
      ) : (
        <PlanPicker
          plans={plans}
          selectedId={selectedId}
          onSelect={handleSelect}
          unavailableTypes={unavailableTypes}
        />
      )}

      <FieldError message={validationError} />
    </RegistrationLayout>
  );
};
