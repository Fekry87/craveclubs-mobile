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
import { getBranches, Branch } from '../../api/services/registration.service';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  fontFamily,
} from '../../theme';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step5_BranchSelection'
>;

// ── BranchCard (inline) ──────────────────────────────────────────
function BranchCard({
  branch,
  isSelected,
  onPress,
  index,
}: {
  branch: Branch;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}) {
  const entry = useAnimatedEntry(index);
  const press = useAnimatedPress();

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
            styles.branchCard,
            isSelected
              ? styles.branchCardSelected
              : styles.branchCardUnselected,
            press.animatedStyle,
          ]}
        >
          {/* Icon circle */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isSelected
                  ? colors.primaryDim
                  : colors.surfaceLight,
              },
            ]}
          >
            <Icon
              name="building-2-fill"
              size={22}
              color={isSelected ? colors.primary : colors.textDim}
            />
          </View>

          {/* Text content */}
          <View style={styles.branchTextCol}>
            <Text
              style={[
                styles.branchName,
                isSelected && styles.branchNameSelected,
              ]}
            >
              {branch.name}
            </Text>
            <View style={styles.addressRow}>
              <Icon
                name="map-pin-line"
                size={14}
                color={isSelected ? colors.primaryDark : colors.textMuted}
              />
              <Text
                style={[
                  styles.branchAddress,
                  isSelected && styles.branchAddressSelected,
                ]}
                numberOfLines={2}
              >
                {branch.address}, {branch.city}
              </Text>
            </View>
            {branch.phone && (
              <View style={styles.addressRow}>
                <Icon
                  name="phone-line"
                  size={14}
                  color={isSelected ? colors.primaryDark : colors.textMuted}
                />
                <Text
                  style={[
                    styles.branchAddress,
                    isSelected && styles.branchAddressSelected,
                  ]}
                >
                  {branch.phone}
                </Text>
              </View>
            )}
          </View>

          {/* Checkmark */}
          {isSelected && (
            <Icon
              name="checkbox-circle-fill"
              size={22}
              color={colors.primary}
            />
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

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

  // ── Loading state ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <RegistrationLayout
        currentStep={5}
        title="Select Branch"
        subtitle="Choose your preferred training location"
        onBack={() => {
          setStep(4);
          navigation.goBack();
        }}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading branches...</Text>
        </View>
      </RegistrationLayout>
    );
  }

  // ── Error state ───────────────────────────────────────────────
  if (error) {
    return (
      <RegistrationLayout
        currentStep={5}
        title="Select Branch"
        subtitle="Choose your preferred training location"
        onBack={() => {
          setStep(4);
          navigation.goBack();
        }}
      >
        <View style={styles.centerContainer}>
          <Icon name="error-warning-fill" size={48} color={colors.error} />
          <Text style={styles.errorMessage}>{error}</Text>
          <Button title="Try Again" onPress={fetchBranches} variant="blue" />
        </View>
      </RegistrationLayout>
    );
  }

  return (
    <RegistrationLayout
      currentStep={5}
      title="Select Branch"
      subtitle="Choose your preferred training location"
      onBack={() => {
        setStep(4);
        navigation.goBack();
      }}
      ctaTitle="Continue"
      onCtaPress={handleContinue}
    >
      {/* Branch cards */}
      {branches.map((branch, index) => (
        <BranchCard
          key={branch.id}
          branch={branch}
          isSelected={selectedId === branch.id}
          onPress={() => handleSelect(branch)}
          index={index}
        />
      ))}

      {/* Empty state */}
      {branches.length === 0 && (
        <View style={styles.centerContainer}>
          <Icon name="building-2-fill" size={48} color={colors.textDim} />
          <Text style={styles.emptyText}>No branches available</Text>
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
  // ── Branch Card ───────────────────────────────────────────────
  branchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
  },
  branchCardUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  branchCardSelected: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchTextCol: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  branchName: {
    ...typography.bodyMedium,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  branchNameSelected: {
    color: colors.primary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  branchAddress: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
  branchAddressSelected: {
    color: colors.primaryDark,
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
