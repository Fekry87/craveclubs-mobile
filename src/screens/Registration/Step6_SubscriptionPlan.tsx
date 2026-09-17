import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { PlanPicker } from '../../components/features/registration/PlanPicker';
import { StepStatus } from '../../components/features/registration/StepStatus';
import { FieldError } from '../../components/features/registration/SectionLabel';
import { useRegistrationStore } from '../../store/registration.store';
import {
  getSubscriptionPlans,
  SubscriptionPlan,
} from '../../api/services/registration.service';
import { planPrice } from '../../utils/formatters';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step6_SubscriptionPlan'
>;

// ── Main Screen ─────────────────────────────────────────────────
export const Step6_SubscriptionPlan: React.FC<Props> = ({ navigation }) => {
  const { planId, setPlan, setStep } = useRegistrationStore();

  // ── State ─────────────────────────────────────────────────────
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
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


  // ── Fetch plans ───────────────────────────────────────────────
  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSubscriptionPlans();
      setPlans(data);
    } catch {
      setError('Failed to load plans. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleSelect = (plan: SubscriptionPlan) => {
    setSelectedId(plan.id);
    if (validationError) setValidationError(null);
  };

  const handleContinue = () => {
    if (!selectedId) {
      setValidationError('Please select a subscription plan');
      return;
    }
    const plan = plans.find((p) => p.id === selectedId);
    if (plan) {
      setPlan(plan.id, plan.name, planPrice(plan), plan.training_type);
    }
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
        <PlanPicker plans={plans} selectedId={selectedId} onSelect={handleSelect} />
      )}

      <FieldError message={validationError} />
    </RegistrationLayout>
  );
};
