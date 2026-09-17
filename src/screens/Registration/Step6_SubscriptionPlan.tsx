import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { SelectCard } from '../../components/features/registration/SelectCard';
import { StepStatus } from '../../components/features/registration/StepStatus';
import { FieldError } from '../../components/features/registration/SectionLabel';
import { useRegistrationStore } from '../../store/registration.store';
import {
  getSubscriptionPlans,
  SubscriptionPlan,
} from '../../api/services/registration.service';
import { colors, spacing, borderRadius, fontFamily, typography } from '../../theme';
import { formatMoney, planPrice } from '../../utils/formatters';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step6_SubscriptionPlan'
>;

const months = (n: number) => `${n} ${n === 1 ? 'month' : 'months'}`;

// ── Main Screen ─────────────────────────────────────────────────
export const Step6_SubscriptionPlan: React.FC<Props> = ({ navigation }) => {
  const { planId, setPlan, setStep } = useRegistrationStore();

  // ── State ─────────────────────────────────────────────────────
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(planId);
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
      setPlan(plan.id, plan.name, planPrice(plan));
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
      subtitle="Pick the plan that fits your goals"
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
        plans.map((plan, index) => {
          const selected = selectedId === plan.id;
          return (
            <SelectCard
              key={plan.id}
              title={plan.name}
              subtitle={months(plan.duration_months)}
              badge={plan.is_popular ? 'Popular' : undefined}
              selected={selected}
              onPress={() => handleSelect(plan)}
              index={index}
            >
              {/* Price — the amount actually charged, not the list price. This used
                  to render plan.price beside a "N% off" badge, so the app quoted 500
                  while the portal quoted 450 for the same plan and the registration
                  was billed 450. */}
              <View style={styles.priceRow}>
                <Text style={[styles.price, selected && { color: colors.primary }]}>
                  {formatMoney(planPrice(plan))}
                </Text>
                {plan.discount_percent > 0 && (
                  <>
                    <Text style={styles.listPrice}>{formatMoney(plan.price)}</Text>
                    <View style={styles.savePill}>
                      <Text style={styles.saveText}>Save {plan.discount_percent}%</Text>
                    </View>
                  </>
                )}
              </View>
            </SelectCard>
          );
        })
      )}

      <FieldError message={validationError} />
    </RegistrationLayout>
  );
};

const styles = StyleSheet.create({
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  price: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  listPrice: {
    ...typography.caption,
    color: colors.textDim,
    textDecorationLine: 'line-through',
  },
  savePill: {
    backgroundColor: colors.successDim,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  saveText: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.swimmerDark,
  },
});
