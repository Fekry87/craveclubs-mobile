import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { Card } from '../../components/common/Card';
import { InfoRow, InfoRowProps } from '../../components/common/InfoRow';
import { useRegistrationStore } from '../../store/registration.store';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { submitRegistration } from '../../api/services/registration.service';
import { formatMoney } from '../../utils/formatters';
import { colors, spacing, fontFamily } from '../../theme';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step8_ReviewPayment'
>;

type Row = Omit<InfoRowProps, 'isLast'>;

const capitalize = (value: string | null | undefined) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : '—';

// ── ReviewSection (inline) ──────────────────────────────────────
// A titled card of rows with an "Edit" link back to the step that owns them.
function ReviewSection({
  title,
  rows,
  onEdit,
  index,
}: {
  title: string;
  rows: Row[];
  onEdit: () => void;
  index: number;
}) {
  const entry = useAnimatedEntry(index);
  return (
    <Animated.View style={[styles.section, entry]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity
          onPress={onEdit}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${title.toLowerCase()}`}
        >
          <Text style={[styles.editLink, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
      </View>
      <Card>
        {rows.map((row, i) => (
          <InfoRow key={row.label} {...row} isLast={i === rows.length - 1} />
        ))}
      </Card>
    </Animated.View>
  );
}

// ── Main Screen ─────────────────────────────────────────────────
export const Step8_ReviewPayment: React.FC<Props> = ({ navigation }) => {
  const store = useRegistrationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { basicProfile, physicalInfo, experience } = store;

  const birthDate = basicProfile.birthDate ? new Date(basicProfile.birthDate) : null;
  const age = birthDate
    ? Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  // Going back to a step pops every screen after it; the answers stay in the
  // store, so the swimmer only changes what they came back for.
  const editStep = (step: number, route: keyof RegistrationStackParamList) => {
    store.setStep(step);
    navigation.navigate(route as never);
  };

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

  const aboutRows: Row[] = [
    { icon: 'user-line', label: 'Full name', value: basicProfile.fullName || '—' },
    { icon: 'phone-line', label: 'Phone', value: basicProfile.phone || '—' },
    { icon: 'user-smile-line', label: 'Gender', value: capitalize(basicProfile.gender) },
    {
      icon: 'cake-2-line',
      label: 'Date of birth',
      value: birthDate
        ? birthDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—',
      hint: age !== null ? `${age} years old` : undefined,
    },
  ];
  if (basicProfile.guardianName || basicProfile.guardianPhone) {
    aboutRows.push({
      icon: 'hand-heart-line',
      label: 'Parent or guardian',
      value: basicProfile.guardianName || '—',
      hint: [basicProfile.guardianPhone, basicProfile.guardianEmail].filter(Boolean).join(' · ') || undefined,
    });
  }

  const bodyRows: Row[] = [
    {
      icon: 'run-line',
      label: 'Height and weight',
      value: `${physicalInfo.heightCm} cm · ${physicalInfo.weightKg} kg`,
    },
    { icon: 'heart-pulse-line', label: 'Fitness level', value: capitalize(physicalInfo.fitnessLevel) },
  ];
  if (physicalInfo.medicalNotes?.trim()) {
    bodyRows.push({ icon: 'first-aid-kit-line', label: 'Medical notes', value: physicalInfo.medicalNotes.trim() });
  }

  const experienceRows: Row[] = [
    { icon: 'trophy-line', label: 'Skill level', value: capitalize(experience.level) },
    { icon: 'flag-line', label: 'Main goal', value: experience.primaryGoal ?? '—' },
    { icon: 'calendar-event-line', label: 'How often', value: experience.weeklyFrequency ?? '—' },
  ];

  const trainingRows: Row[] = [
    { icon: 'building-2-line', label: 'Branch', value: store.branchName ?? '—' },
    {
      icon: 'gift-line',
      label: 'Plan',
      value: store.planName ?? '—',
      hint: store.planName ? formatMoney(store.planPrice ?? 0) : undefined,
    },
    { icon: 'user-star-line', label: 'Coach', value: store.coachName ?? '—' },
    // What the registration is sent with; nothing is charged in the app.
    { icon: 'hand-coin-line', label: 'Payment', value: 'Cash, at the club' },
  ];

  return (
    <RegistrationLayout
      currentStep={8}
      title="Review and submit"
      subtitle="Check your details before you send them"
      onBack={() => {
        store.setStep(7);
        navigation.goBack();
      }}
      ctaTitle={isSubmitting ? 'Submitting…' : 'Submit registration'}
      onCtaPress={handleSubmit}
      ctaLoading={isSubmitting}
      ctaDisabled={isSubmitting}
    >
      <ReviewSection title="About you" rows={aboutRows} index={0} onEdit={() => editStep(1, 'Step1_BasicProfile')} />
      <ReviewSection title="Body and fitness" rows={bodyRows} index={1} onEdit={() => editStep(2, 'Step2_PhysicalInfo')} />
      <ReviewSection title="Experience" rows={experienceRows} index={2} onEdit={() => editStep(4, 'Step4_ExperienceLevel')} />
      <ReviewSection title="Training" rows={trainingRows} index={3} onEdit={() => editStep(5, 'Step5_BranchSelection')} />
    </RegistrationLayout>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.bodyMedium,
    color: colors.text,
  },
  editLink: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.bodySemiBold,
  },
});
