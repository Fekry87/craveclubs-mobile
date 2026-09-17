import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { BranchOption } from '../../components/features/registration/TrainingOptions';
import { StepStatus } from '../../components/features/registration/StepStatus';
import { FieldError } from '../../components/features/registration/SectionLabel';
import { useRegistrationStore } from '../../store/registration.store';
import { getBranches, Branch } from '../../api/services/registration.service';

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

  // Reload on focus: the review screen may have changed this choice meanwhile.
  useFocusEffect(
    useCallback(() => {
      setSelectedId(useRegistrationStore.getState().branchId);
    }, []),
  );
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
        branches.map((item, index) => (
          <BranchOption
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
