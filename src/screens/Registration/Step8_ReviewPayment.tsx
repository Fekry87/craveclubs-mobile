import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { Card } from '../../components/common/Card';
import { InfoRow, InfoRowProps } from '../../components/common/InfoRow';
import { FormSheet } from '../../components/common/FormSheet';
import { AboutYouFields } from '../../components/features/registration/AboutYouFields';
import { BodyFields } from '../../components/features/registration/BodyFields';
import { ExperienceFields } from '../../components/features/registration/ExperienceFields';
import {
  BranchOption,
  CoachOption,
} from '../../components/features/registration/TrainingOptions';
import { PlanPicker } from '../../components/features/registration/PlanPicker';
import { SectionLabel, FieldError } from '../../components/features/registration/SectionLabel';
import { StepStatus } from '../../components/features/registration/StepStatus';
import { useRegistrationStore } from '../../store/registration.store';
import { useFormAnswers } from '../../hooks/useFormAnswers';
import { useTrainingOptions } from '../../hooks/useTrainingOptions';
import {
  AboutYouValues,
  BodyValues,
  ExperienceValues,
  aboutFromStore,
  ageFromBirthDate,
  bodyFromStore,
  experienceFromStore,
  cleanAboutYou,
  validateAboutYou,
  validateBody,
  validateExperience,
} from '../../utils/registrationValidation';
import { planPrice } from '../../utils/formatters';
import { trainingTypeLabel, trainingTypesIn } from '../../utils/trainingTypes';
import { coachesWithOpenGroups, typesWithOpenGroups } from '../../utils/groupAvailability';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import {
  checkEmailAvailability,
  describeRegistrationError,
  submitRegistration,
} from '../../api/services/registration.service';
import { formatMoney } from '../../utils/formatters';
import { colors, spacing, fontFamily } from '../../theme';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step8_ReviewPayment'
>;

type Row = Omit<InfoRowProps, 'isLast'>;

type Section = 'about' | 'body' | 'experience' | 'training' | 'group';

/** Which review card each payload field the server may refuse is edited in. */
const SECTION_OF_FIELD: Record<string, Section> = {
  full_name: 'about',
  phone: 'about',
  email: 'about',
  guardian_name: 'about',
  guardian_phone: 'about',
  guardian_email: 'about',
  gender: 'about',
  birth_date: 'about',
  height_cm: 'body',
  weight_kg: 'body',
  fitness_level: 'body',
  medical_notes: 'body',
  experience_level: 'experience',
  primary_goal: 'experience',
  branch_id: 'training',
  plan_id: 'training',
  coach_id: 'training',
  // "This group has just filled up": back to the group step, which refetches.
  group_id: 'group',
};


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
  const [checkingEmail, setCheckingEmail] = useState(false);
  const { basicProfile, physicalInfo, experience } = store;

  const birthDate = basicProfile.birthDate ? new Date(basicProfile.birthDate) : null;
  const age = basicProfile.birthDate ? ageFromBirthDate(basicProfile.birthDate) : null;

  // ── Editing in place ──────────────────────────────────────────
  // Edit opens a sheet with that section's fields, pre-filled. Saving validates
  // with the step's own rules, writes to the store and closes — the swimmer
  // stays here instead of walking back through every step to reach Submit.
  const [editing, setEditing] = useState<Section | null>(null);

  const aboutForm = useFormAnswers<AboutYouValues>(aboutFromStore(basicProfile));
  const bodyForm = useFormAnswers<BodyValues>(bodyFromStore(physicalInfo));
  const experienceForm = useFormAnswers<ExperienceValues>(experienceFromStore(experience));
  const training = useTrainingOptions(store.clubSlug);
  const [trainingDraft, setTrainingDraft] = useState({
    branchId: store.branchId,
    planId: store.planId,
    coachId: store.coachId,
  });
  const [trainingError, setTrainingError] = useState<string | null>(null);

  // The sheet follows the same rule as the steps: the draft plan's type
  // decides which coaches are offered, and a type with no open group can't
  // be chosen at all.
  const draftPlanType =
    training.options?.plans.find((p) => p.id === trainingDraft.planId)?.training_type ?? null;
  const unavailableTypes = useMemo(() => {
    if (!training.options) return new Set<string>();
    const open = typesWithOpenGroups(training.options.groups);
    return new Set(trainingTypesIn(training.options.plans).filter((t) => !open.has(t)));
  }, [training.options]);
  const availableCoaches = useMemo(
    () =>
      training.options
        ? coachesWithOpenGroups(training.options.coaches, training.options.groups, draftPlanType)
        : [],
    [training.options, draftPlanType],
  );

  const openEditor = (section: Section) => {
    if (section === 'group') {
      store.setStep(8);
      navigation.navigate('Step7b_GroupSelection');
      return;
    }
    if (section === 'about') aboutForm.reset(aboutFromStore(basicProfile));
    if (section === 'body') bodyForm.reset(bodyFromStore(physicalInfo));
    if (section === 'experience') experienceForm.reset(experienceFromStore(experience));
    if (section === 'training') {
      setTrainingDraft({ branchId: store.branchId, planId: store.planId, coachId: store.coachId });
      setTrainingError(null);
      if (!training.options) training.load();
    }
    setEditing(section);
  };

  // A changed email is checked the way Step 1 checks it, so the sheet can't
  // save an address the submission would refuse.
  const saveAbout = async (): Promise<boolean> => {
    if (!aboutForm.validate(validateAboutYou)) return false;
    const cleaned = cleanAboutYou(aboutForm.answers);
    if (cleaned.email !== basicProfile.email) {
      setCheckingEmail(true);
      try {
        const problem = await checkEmailAvailability(cleaned.email);
        if (problem) {
          aboutForm.setFieldError('email', problem);
          return false;
        }
      } catch {
        aboutForm.setFieldError('email', "We couldn't check this email. Check your connection and try again.");
        return false;
      } finally {
        setCheckingEmail(false);
      }
    }
    store.updateBasicProfile(cleaned);
    return true;
  };

  const saveEdit = async () => {
    switch (editing) {
      case 'about':
        if (!(await saveAbout())) return;
        break;
      case 'body':
        if (!bodyForm.validate(validateBody)) return;
        store.updatePhysicalInfo(bodyForm.answers);
        break;
      case 'experience':
        if (!experienceForm.validate(validateExperience)) return;
        store.updateExperience(experienceForm.answers);
        break;
      case 'training': {
        const options = training.options;
        if (!options) return;
        const branch = options.branches.find((b) => b.id === trainingDraft.branchId);
        const plan = options.plans.find((p) => p.id === trainingDraft.planId);
        const coach = availableCoaches.find((c) => c.id === trainingDraft.coachId);
        if (!branch || !plan || !coach) {
          setTrainingError('Choose a branch, a plan and a coach.');
          return;
        }
        if (unavailableTypes.has(plan.training_type)) {
          setTrainingError(
            `All ${trainingTypeLabel(plan.training_type).toLowerCase()} groups are full right now. Choose a plan of another type.`,
          );
          return;
        }
        // A new coach or a new type both need a new group: groups belong to a
        // coach and are of one type.
        const needsGroup = coach.id !== store.coachId || plan.training_type !== store.planTrainingType;
        store.setBranch(branch.id, branch.name);
        store.setPlan(plan.id, plan.name, planPrice(plan), plan.training_type);
        store.setCoach(coach.id, coach.name, coach.user_id ?? null);
        if (needsGroup) {
          store.clearGroup();
          setEditing(null);
          openEditor('group');
          return;
        }
        break;
      }
      default:
        return;
    }
    setEditing(null);
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
      !store.groupId ||
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
        email: store.basicProfile.email || undefined,
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
        // How often they train comes from the plan's type now, not a question.
        weekly_frequency: trainingTypeLabel(store.planTrainingType) || undefined,
        branch_id: store.branchId,
        plan_id: store.planId,
        coach_id: store.coachId,
        group_id: store.groupId,
        preferred_time: store.preferredTime ?? 'flexible',
        payment_method: 'cash',
      });

      navigation.navigate('RegistrationSuccess', {
        swimmerName: store.basicProfile.fullName,
        branchName: store.branchName ?? '',
        coachName: store.coachName ?? '',
        planName: store.planName ?? '',
        groupName: store.groupName,
      });
    } catch (err: unknown) {
      // The server's 422 messages are written for the swimmer ("This email is
      // already registered…"); when it names a field on this screen, offer the
      // edit sheet for it instead of sending them back through the steps.
      const problem = describeRegistrationError(err);
      const section = problem.field ? SECTION_OF_FIELD[problem.field] : undefined;
      Alert.alert(
        "Couldn't submit",
        problem.message,
        section
          ? [
              { text: 'Not now', style: 'cancel' },
              {
                text: section === 'group' ? 'Choose another group' : 'Edit',
                onPress: () => openEditor(section),
              },
            ]
          : undefined,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const aboutRows: Row[] = [
    { icon: 'user-line', label: 'Full name', value: basicProfile.fullName || '—' },
    { icon: 'phone-line', label: 'Phone', value: basicProfile.phone || '—' },
    { icon: 'mail-line', label: 'Email', value: basicProfile.email || '—' },
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
  ];

  const trainingRows: Row[] = [
    { icon: 'building-2-line', label: 'Branch', value: store.branchName ?? '—' },
    {
      icon: 'gift-line',
      label: 'Plan',
      value: store.planName ?? '—',
      hint: store.planName
        ? [formatMoney(store.planPrice ?? 0), trainingTypeLabel(store.planTrainingType)]
            .filter(Boolean)
            .join(' · ')
        : undefined,
    },
    { icon: 'user-star-line', label: 'Coach', value: store.coachName ?? '—' },
    // What the registration is sent with; nothing is charged in the app.
    { icon: 'hand-coin-line', label: 'Payment', value: 'Cash, at the club' },
  ];

  const groupRows: Row[] = [
    {
      icon: 'group-line',
      label: 'Group',
      value: store.groupName ?? 'Not chosen yet',
      hint: store.groupName
        ? [trainingTypeLabel(store.groupType), store.groupSchedule].filter(Boolean).join(' · ')
        : undefined,
    },
  ];

  return (
    <RegistrationLayout
      currentStep={9}
      title="Review and submit"
      subtitle="Check your details before you send them"
      onBack={() => {
        store.setStep(8);
        navigation.goBack();
      }}
      ctaTitle={isSubmitting ? 'Submitting…' : 'Submit registration'}
      onCtaPress={handleSubmit}
      ctaLoading={isSubmitting}
      ctaDisabled={isSubmitting}
    >
      <ReviewSection title="About you" rows={aboutRows} index={0} onEdit={() => openEditor('about')} />
      <ReviewSection title="Body and fitness" rows={bodyRows} index={1} onEdit={() => openEditor('body')} />
      <ReviewSection title="Experience" rows={experienceRows} index={2} onEdit={() => openEditor('experience')} />
      <ReviewSection title="Training" rows={trainingRows} index={3} onEdit={() => openEditor('training')} />
      <ReviewSection title="Group" rows={groupRows} index={4} onEdit={() => openEditor('group')} />

      {/* ── Edit sheets ─────────────────────────────────────────── */}
      <FormSheet
        visible={editing === 'about'}
        title="Edit your details"
        onClose={() => setEditing(null)}
        onSave={saveEdit}
        saving={checkingEmail}
      >
        <AboutYouFields
          value={aboutForm.answers}
          onChange={aboutForm.handleChange}
          errors={aboutForm.errors}
        />
      </FormSheet>

      <FormSheet
        visible={editing === 'body'}
        title="Edit body and fitness"
        onClose={() => setEditing(null)}
        onSave={saveEdit}
      >
        <BodyFields value={bodyForm.answers} onChange={bodyForm.handleChange} errors={bodyForm.errors} />
      </FormSheet>

      <FormSheet
        visible={editing === 'experience'}
        title="Edit experience"
        onClose={() => setEditing(null)}
        onSave={saveEdit}
      >
        <ExperienceFields
          value={experienceForm.answers}
          onChange={experienceForm.handleChange}
          errors={experienceForm.errors}
        />
      </FormSheet>

      <FormSheet
        visible={editing === 'training'}
        title="Edit training"
        onClose={() => setEditing(null)}
        onSave={saveEdit}
        saveDisabled={!training.options}
      >
        {training.isLoading || (!training.options && !training.error) ? (
          <StepStatus kind="loading" message="Loading the club's options…" />
        ) : training.error || !training.options ? (
          <StepStatus kind="error" message={training.error ?? ''} onRetry={training.load} />
        ) : (
          <>
            <SectionLabel>Branch</SectionLabel>
            {training.options.branches.map((item) => (
              <BranchOption
                key={item.id}
                item={item}
                selected={trainingDraft.branchId === item.id}
                onPress={() => setTrainingDraft((d) => ({ ...d, branchId: item.id }))}
              />
            ))}
            <View style={styles.sheetSection}>
              <SectionLabel>Plan</SectionLabel>
              <PlanPicker
                plans={training.options.plans}
                selectedId={trainingDraft.planId}
                onSelect={(item) => {
                  if (unavailableTypes.has(item.training_type)) return;
                  // A new type means a new set of coaches; don't carry one over.
                  setTrainingDraft((d) => ({
                    ...d,
                    planId: item.id,
                    coachId: item.training_type === draftPlanType ? d.coachId : null,
                  }));
                  setTrainingError(null);
                }}
                unavailableTypes={unavailableTypes}
              />
            </View>
            <View style={styles.sheetSection}>
              <SectionLabel hint={draftPlanType ? `With an open ${trainingTypeLabel(draftPlanType).toLowerCase()} group` : undefined}>
                Coach
              </SectionLabel>
              {availableCoaches.length === 0 ? (
                <Text style={styles.sheetEmpty}>
                  No coach has an open group of this type right now. Pick a plan of another type.
                </Text>
              ) : (
                availableCoaches.map((item) => (
                  <CoachOption
                    key={item.id}
                    item={item}
                    selected={trainingDraft.coachId === item.id}
                    onPress={() => setTrainingDraft((d) => ({ ...d, coachId: item.id }))}
                  />
                ))
              )}
            </View>
            <FieldError message={trainingError} />
          </>
        )}
      </FormSheet>
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
  sheetSection: {
    marginTop: spacing.lg,
  },
  sheetEmpty: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },
  editLink: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.bodySemiBold,
  },
});
