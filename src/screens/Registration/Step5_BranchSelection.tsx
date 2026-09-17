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
import { getBranches, Branch } from '../../api/services/registration.service';
import { colors, spacing, borderRadius, typography } from '../../theme';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step5_BranchSelection'
>;

// ── Main Screen ─────────────────────────────────────────────────
export const Step5_BranchSelection: React.FC<Props> = ({ navigation }) => {
  const { branchId, setBranch, setStep } = useRegistrationStore();

  // ── State ─────────────────────────────────────────────────────
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(branchId);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);


  // ── Fetch branches ────────────────────────────────────────────
  const fetchBranches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getBranches();
      setBranches(data);
    } catch {
      setError('Failed to load branches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleSelect = (branch: Branch) => {
    setSelectedId(branch.id);
    if (validationError) setValidationError(null);
  };

  const handleContinue = () => {
    if (!selectedId) {
      setValidationError('Please select a branch');
      return;
    }
    const branch = branches.find((b) => b.id === selectedId);
    if (branch) {
      setBranch(branch.id, branch.name);
    }
    setStep(6);
    navigation.navigate('Step6_SubscriptionPlan');
  };

  const onBack = () => {
    setStep(4);
    navigation.goBack();
  };

  return (
    <RegistrationLayout
      currentStep={5}
      title="Choose a branch"
      subtitle="Where would you like to train?"
      onBack={onBack}
      ctaTitle={isLoading || error || branches.length === 0 ? undefined : 'Continue'}
      onCtaPress={handleContinue}
    >
      {isLoading ? (
        <StepStatus kind="loading" message="Loading branches…" />
      ) : error ? (
        <StepStatus kind="error" message={error} onRetry={fetchBranches} />
      ) : branches.length === 0 ? (
        <StepStatus
          kind="empty"
          icon="building-2-line"
          title="No branches yet"
          message="This club hasn't added a branch. Please check with the club."
        />
      ) : (
        branches.map((branch, index) => {
          const selected = selectedId === branch.id;
          const address = [branch.address, branch.city].filter(Boolean).join(', ');
          return (
            <SelectCard
              key={branch.id}
              title={branch.name}
              subtitle={address || null}
              selected={selected}
              onPress={() => handleSelect(branch)}
              index={index}
              leading={
                <View
                  style={[
                    styles.iconTile,
                    { backgroundColor: selected ? colors.white : colors.surfaceLight },
                  ]}
                >
                  <Icon
                    name="building-2-line"
                    size={22}
                    color={selected ? colors.primary : colors.textMuted}
                  />
                </View>
              }
            >
              {branch.phone ? (
                <View style={styles.metaRow}>
                  <Icon name="phone-line" size={14} color={colors.textMuted} />
                  <Text style={styles.metaText}>{branch.phone}</Text>
                </View>
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
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
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
});
