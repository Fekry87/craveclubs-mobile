import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Animated,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { ChoiceChipGroup } from '../../components/features/registration/ChoiceChip';
import { SectionLabel, FieldError } from '../../components/features/registration/SectionLabel';
import { useRegistrationStore } from '../../store/registration.store';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  fontFamily,
} from '../../theme';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step2_PhysicalInfo'
>;

type FitnessLevel = 'excellent' | 'good' | 'average' | 'beginner';

// Least to most, the order people think in.
const FITNESS_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'average', label: 'Average' },
  { value: 'good', label: 'Good' },
  { value: 'excellent', label: 'Excellent' },
] as const satisfies readonly { value: FitnessLevel; label: string }[];

const MEDICAL_MAX = 300;

export const Step2_PhysicalInfo: React.FC<Props> = ({ navigation }) => {
  const { physicalInfo, updatePhysicalInfo, setStep } =
    useRegistrationStore();

  // ── Local form state (rehydrate from store) ──────────────────
  const [heightCm, setHeightCm] = useState(
    physicalInfo.heightCm ?? 170,
  );
  const [weightKg, setWeightKg] = useState(
    physicalInfo.weightKg ?? 70,
  );
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | null>(
    physicalInfo.fitnessLevel ?? null,
  );
  const [medicalNotes, setMedicalNotes] = useState(
    physicalInfo.medicalNotes ?? '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Animations ───────────────────────────────────────────────
  const heightEntry = useAnimatedEntry(0);
  const weightEntry = useAnimatedEntry(1);
  const fitnessEntry = useAnimatedEntry(2);
  const medicalEntry = useAnimatedEntry(3);

  // ── Clear field error on change ──────────────────────────────
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // ── Validation ───────────────────────────────────────────────
  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!fitnessLevel) {
      errs.fitnessLevel = 'Please select your fitness level';
    }
    return errs;
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleContinue = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    updatePhysicalInfo({
      heightCm,
      weightKg,
      fitnessLevel,
      medicalNotes,
    });
    setStep(3);
    navigation.navigate('Step3_SportType');
  };

  return (
    <RegistrationLayout
      currentStep={2}
      title="Physical information"
      subtitle="Helps your coach build the right plan"
      onBack={() => {
        setStep(1);
        navigation.goBack();
      }}
      ctaTitle="Continue"
      onCtaPress={handleContinue}
    >
      {/* ── Height & weight ──────────────────────────────────────── */}
      <Animated.View style={[styles.measureCard, heightEntry]}>
        <View style={styles.measureHeader}>
          <Text style={styles.measureLabel}>Height</Text>
          <Text style={styles.measureValue}>
            {heightCm}
            <Text style={styles.measureUnit}> cm</Text>
          </Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={100}
          maximumValue={220}
          step={1}
          value={heightCm}
          onValueChange={(v) => setHeightCm(Math.round(v))}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
          accessibilityLabel="Height in centimetres"
        />
        <View style={styles.rangeRow}>
          <Text style={styles.rangeText}>100</Text>
          <Text style={styles.rangeText}>220</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.measureCard, weightEntry]}>
        <View style={styles.measureHeader}>
          <Text style={styles.measureLabel}>Weight</Text>
          <Text style={styles.measureValue}>
            {weightKg}
            <Text style={styles.measureUnit}> kg</Text>
          </Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={30}
          maximumValue={200}
          step={1}
          value={weightKg}
          onValueChange={(v) => setWeightKg(Math.round(v))}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
          accessibilityLabel="Weight in kilograms"
        />
        <View style={styles.rangeRow}>
          <Text style={styles.rangeText}>30</Text>
          <Text style={styles.rangeText}>200</Text>
        </View>
      </Animated.View>

      {/* ── Fitness level ────────────────────────────────────────── */}
      <Animated.View style={[styles.section, fitnessEntry]}>
        <SectionLabel>Fitness level</SectionLabel>
        <ChoiceChipGroup
          options={FITNESS_OPTIONS}
          value={fitnessLevel}
          onChange={(value) => {
            setFitnessLevel(value);
            clearError('fitnessLevel');
          }}
          hasError={!!errors.fitnessLevel}
        />
        <FieldError message={errors.fitnessLevel} />
      </Animated.View>

      {/* ── Medical notes ────────────────────────────────────────── */}
      <Animated.View style={[styles.section, medicalEntry]}>
        <SectionLabel hint="Optional">Medical notes</SectionLabel>
        <TextInput
          style={styles.textArea}
          placeholder="Anything your coach should know, e.g. asthma or a recent injury"
          placeholderTextColor={colors.textDim}
          multiline
          maxLength={MEDICAL_MAX}
          value={medicalNotes}
          onChangeText={setMedicalNotes}
          textAlignVertical="top"
          accessibilityLabel="Medical notes"
        />
        <Text style={styles.charCounter}>
          {medicalNotes.length}/{MEDICAL_MAX}
        </Text>
      </Animated.View>
    </RegistrationLayout>
  );
};

const styles = StyleSheet.create({
  // ── Height & weight ─────────────────────────────────────────
  measureCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm + 4,
  },
  measureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  measureLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.bodyMedium,
    color: colors.text,
  },
  measureValue: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  measureUnit: {
    fontSize: 14,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    ...typography.caption,
    color: colors.textDim,
  },

  // ── Sections ────────────────────────────────────────────────
  section: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  // ── Medical notes ───────────────────────────────────────────
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + 4,
    paddingBottom: spacing.sm + 4,
    minHeight: 104,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
  },
  charCounter: {
    ...typography.caption,
    color: colors.textDim,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});
