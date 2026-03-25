import React, { useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { Icon, IconName } from '../../components/common/Icon';
import { useRegistrationStore } from '../../store/registration.store';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { submitRegistration } from '../../api/services/registration.service';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  fontFamily,
} from '../../theme';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step8_ReviewPayment'
>;

// ── ReviewRow (inline) ───────────────────────────────────────────
function ReviewRow({
  icon,
  label,
  value,
  index,
  iconColor,
}: {
  icon: IconName;
  label: string;
  value: string;
  index: number;
  iconColor?: string;
}) {
  const entry = useAnimatedEntry(index);

  return (
    <Animated.View style={[styles.reviewRow, entry]}>
      <View
        style={[
          styles.reviewIconCircle,
          { backgroundColor: (iconColor ?? colors.primary) + '18' },
        ]}
      >
        <Icon name={icon} size={18} color={iconColor ?? colors.primary} />
      </View>
      <View style={styles.reviewTextCol}>
        <Text style={styles.reviewLabel}>{label}</Text>
        <Text style={styles.reviewValue}>{value}</Text>
      </View>
    </Animated.View>
  );
}

// ── Section Header (inline) ─────────────────────────────────────
function SectionHeader({
  title,
  index,
}: {
  title: string;
  index: number;
}) {
  const entry = useAnimatedEntry(index);
  return (
    <Animated.View style={[styles.sectionHeader, entry]}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </Animated.View>
  );
}

// ── Main Screen ─────────────────────────────────────────────────
export const Step8_ReviewPayment: React.FC<Props> = ({ navigation }) => {
  const store = useRegistrationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Derived display values ────────────────────────────────────
  const genderLabel =
    store.basicProfile.gender === 'male'
      ? 'Male'
      : store.basicProfile.gender === 'female'
        ? 'Female'
        : '—';

  const fitnessLabel =
    store.physicalInfo.fitnessLevel
      ? store.physicalInfo.fitnessLevel.charAt(0).toUpperCase() +
        store.physicalInfo.fitnessLevel.slice(1)
      : '—';

  const experienceLabel =
    store.experience.level
      ? store.experience.level.charAt(0).toUpperCase() +
        store.experience.level.slice(1)
      : '—';

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // Validate critical fields
    if (
      !store.basicProfile.fullName ||
      !store.basicProfile.gender ||
      !store.branchId ||
      !store.planId ||
      !store.coachId ||
      !store.experience.level
    ) {
      Alert.alert(
        'Incomplete Registration',
        'Please go back and complete all steps before submitting.',
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await submitRegistration({
        club_slug: store.clubSlug || undefined,
        full_name: store.basicProfile.fullName,
        phone: store.basicProfile.phone,
        guardian_name: store.basicProfile.guardianName || undefined,
        guardian_phone: store.basicProfile.guardianPhone || undefined,
        guardian_email: store.basicProfile.guardianEmail || undefined,
        gender: store.basicProfile.gender,
        birth_date: store.basicProfile.birthDate ?? '',
        height_cm: store.physicalInfo.heightCm,
        weight_kg: store.physicalInfo.weightKg,
        fitness_level: store.physicalInfo.fitnessLevel ?? 'beginner',
        prior_experience: store.physicalInfo.priorExperience ?? false,
        medical_notes: store.physicalInfo.medicalNotes,
        sport_ids: store.sportIds,
        experience_level: store.experience.level,
        years_experience: store.experience.yearsExperience ?? 'N/A',
        competed: store.experience.competed ?? false,
        primary_goal: store.experience.primaryGoal ?? '',
        weekly_frequency: store.experience.weeklyFrequency ?? '',
        branch_id: store.branchId,
        plan_id: store.planId,
        coach_id: store.coachId,
        preferred_time: store.preferredTime ?? 'flexible',
        payment_method: 'cash',
      });

      navigation.navigate('RegistrationSuccess', {
        swimmerName: store.basicProfile.fullName,
        branchName: store.branchName ?? '',
        coachName: store.coachName ?? '',
        planName: store.planName ?? '',
      });
    } catch {
      Alert.alert(
        'Submission Failed',
        'Something went wrong. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RegistrationLayout
      currentStep={8}
      title="Review & Payment"
      subtitle="Review your registration details"
      onBack={() => {
        store.setStep(7);
        navigation.goBack();
      }}
      ctaTitle={isSubmitting ? 'Submitting...' : 'Submit Registration'}
      onCtaPress={handleSubmit}
      ctaLoading={isSubmitting}
      ctaDisabled={isSubmitting}
    >
      {/* ── Personal Info Section ──────────────────────────────── */}
      <SectionHeader title="Personal Info" index={0} />
      <ReviewRow
        icon="user-fill"
        label="Full Name"
        value={store.basicProfile.fullName || '—'}
        index={1}
      />
      <ReviewRow
        icon="phone-fill"
        label="Phone"
        value={store.basicProfile.phone || '—'}
        index={2}
        iconColor={colors.teal}
      />
      <ReviewRow
        icon={store.basicProfile.gender === 'male' ? 'men-fill' : 'women-fill'}
        label="Gender"
        value={genderLabel}
        index={3}
        iconColor={colors.secondary}
      />

      {/* ── Physical Info Section ──────────────────────────────── */}
      <SectionHeader title="Physical Info" index={4} />
      <ReviewRow
        icon="run-fill"
        label="Height / Weight"
        value={`${store.physicalInfo.heightCm} cm • ${store.physicalInfo.weightKg} kg`}
        index={5}
        iconColor={colors.orange}
      />
      <ReviewRow
        icon="heart-pulse-fill"
        label="Fitness Level"
        value={fitnessLabel}
        index={6}
        iconColor={colors.error}
      />

      {/* ── Experience Section ─────────────────────────────────── */}
      <SectionHeader title="Experience" index={7} />
      <ReviewRow
        icon="trophy-fill"
        label="Skill Level"
        value={experienceLabel}
        index={8}
        iconColor={colors.warning}
      />
      <ReviewRow
        icon="flag-fill"
        label="Goal"
        value={store.experience.primaryGoal ?? '—'}
        index={9}
        iconColor={colors.swimmer}
      />

      {/* ── Selections Section ─────────────────────────────────── */}
      <SectionHeader title="Your Selections" index={10} />
      <ReviewRow
        icon="building-2-fill"
        label="Branch"
        value={store.branchName ?? '—'}
        index={11}
      />
      <ReviewRow
        icon="gift-fill"
        label="Plan"
        value={
          store.planName
            ? `${store.planName} (${store.planPrice ?? 0} EGP)`
            : '—'
        }
        index={12}
        iconColor={colors.swimmer}
      />
      <ReviewRow
        icon="user-settings-fill"
        label="Coach"
        value={store.coachName ?? '—'}
        index={13}
        iconColor={colors.secondary}
      />

    </RegistrationLayout>
  );
};

const styles = StyleSheet.create({
  // ── Section Header ────────────────────────────────────────────
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── Review Row ────────────────────────────────────────────────
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  reviewIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewTextCol: {
    flex: 1,
  },
  reviewLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  reviewValue: {
    ...typography.bodyMedium,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
    marginTop: 1,
  },

});
