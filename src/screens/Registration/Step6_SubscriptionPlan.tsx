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
import {
  getSubscriptionPlans,
  SubscriptionPlan,
} from '../../api/services/registration.service';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  fontFamily,
} from '../../theme';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step6_SubscriptionPlan'
>;

const PLAN_COLORS = [
  { bg: colors.primaryDim, border: colors.primary, accent: colors.primary },
  { bg: colors.swimmerDim, border: colors.swimmer, accent: colors.swimmer },
  { bg: colors.orangeDim, border: colors.orange, accent: colors.orange },
  {
    bg: colors.secondaryDim,
    border: colors.secondary,
    accent: colors.secondary,
  },
];

// ── PlanCard (inline) ────────────────────────────────────────────
function PlanCard({
  plan,
  isSelected,
  onPress,
  index,
}: {
  plan: SubscriptionPlan;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}) {
  const entry = useAnimatedEntry(index);
  const press = useAnimatedPress();
  const colorSet = PLAN_COLORS[index % PLAN_COLORS.length];

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
            styles.planCard,
            {
              backgroundColor: isSelected ? colorSet.bg : colors.surface,
              borderColor: isSelected ? colorSet.border : colors.border,
            },
            press.animatedStyle,
          ]}
        >
          {/* Popular badge */}
          {plan.is_popular && (
            <View style={styles.popularBadge}>
              <Icon name="star-fill" size={12} color={colors.white} />
              <Text style={styles.popularText}>Popular</Text>
            </View>
          )}

          {/* Header row */}
          <View style={styles.planHeader}>
            <View style={styles.planNameCol}>
              <Text
                style={[
                  styles.planName,
                  isSelected && { color: colorSet.accent },
                ]}
              >
                {plan.name}
              </Text>
              <Text style={styles.planDesc}>
                {plan.duration_months} {plan.duration_months === 1 ? 'month' : 'months'}
              </Text>
            </View>
            {isSelected && (
              <Icon
                name="checkbox-circle-fill"
                size={22}
                color={colorSet.accent}
              />
            )}
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text
              style={[
                styles.priceAmount,
                isSelected && { color: colorSet.accent },
              ]}
            >
              {(parseFloat(plan.price) || 0).toLocaleString()} EGP
            </Text>
            <Text style={styles.pricePeriod}>
              / {plan.duration_months} {plan.duration_months === 1 ? 'mo' : 'mos'}
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <Icon
                name="calendar-event-fill"
                size={14}
                color={isSelected ? colorSet.accent : colors.textMuted}
              />
              <Text
                style={[
                  styles.featureText,
                  isSelected && { color: colorSet.accent },
                ]}
              >
                {plan.duration_months} {plan.duration_months === 1 ? 'month' : 'months'}
              </Text>
            </View>
            {plan.discount_percent > 0 && (
              <View style={styles.featureItem}>
                <Icon
                  name="percent-line"
                  size={14}
                  color={isSelected ? colorSet.accent : colors.swimmer}
                />
                <Text
                  style={[
                    styles.discountText,
                    isSelected && { color: colorSet.accent },
                  ]}
                >
                  {plan.discount_percent}% off
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

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
      setPlan(plan.id, plan.name, parseFloat(plan.price));
    }
    setStep(7);
    navigation.navigate('Step7_CoachSelection');
  };

  // ── Loading state ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <RegistrationLayout
        currentStep={6}
        title="Subscription Plan"
        subtitle="Pick the plan that fits your goals"
        onBack={() => {
          setStep(5);
          navigation.goBack();
        }}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      </RegistrationLayout>
    );
  }

  // ── Error state ───────────────────────────────────────────────
  if (error) {
    return (
      <RegistrationLayout
        currentStep={6}
        title="Subscription Plan"
        subtitle="Pick the plan that fits your goals"
        onBack={() => {
          setStep(5);
          navigation.goBack();
        }}
      >
        <View style={styles.centerContainer}>
          <Icon name="error-warning-fill" size={48} color={colors.error} />
          <Text style={styles.errorMessage}>{error}</Text>
          <Button title="Try Again" onPress={fetchPlans} variant="blue" />
        </View>
      </RegistrationLayout>
    );
  }

  return (
    <RegistrationLayout
      currentStep={6}
      title="Subscription Plan"
      subtitle="Pick the plan that fits your goals"
      onBack={() => {
        setStep(5);
        navigation.goBack();
      }}
      ctaTitle="Continue"
      onCtaPress={handleContinue}
    >
      {/* Plan cards */}
      {plans.map((plan, index) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isSelected={selectedId === plan.id}
          onPress={() => handleSelect(plan)}
          index={index}
        />
      ))}

      {/* Empty state */}
      {plans.length === 0 && (
        <View style={styles.centerContainer}>
          <Icon name="gift-fill" size={48} color={colors.textDim} />
          <Text style={styles.emptyText}>No plans available</Text>
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
  // ── Plan Card ─────────────────────────────────────────────────
  planCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  planNameCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  planName: {
    ...typography.bodyMedium,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 16,
    color: colors.text,
  },
  planDesc: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.sm,
  },
  priceAmount: {
    fontSize: 24,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  pricePeriod: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: 4,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  discountText: {
    ...typography.caption,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.swimmer,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    gap: 4,
    marginBottom: spacing.xs,
  },
  popularText: {
    ...typography.label,
    color: colors.white,
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
