import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { useRegistrationStore } from '../../store/registration.store';
import { useAnimatedPress } from '../../hooks/useAnimatedPress';
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

const FITNESS_OPTIONS: { value: FitnessLevel; label: string }[] = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'average', label: 'Average' },
  { value: 'beginner', label: 'Beginner' },
];

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

  const excellentPress = useAnimatedPress();
  const goodPress = useAnimatedPress();
  const averagePress = useAnimatedPress();
  const beginnerPress = useAnimatedPress();

  const chipPressMap: Record<FitnessLevel, ReturnType<typeof useAnimatedPress>> = {
    excellent: excellentPress,
    good: goodPress,
    average: averagePress,
    beginner: beginnerPress,
  };

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
      title="Physical Information"
      subtitle="Helps your coach build the right plan"
      onBack={() => {
        setStep(1);
        navigation.goBack();
      }}
      ctaTitle="Continue"
      onCtaPress={handleContinue}
    >
      {/* ── Height Slider ────────────────────────────────────────── */}
      <Animated.View style={[styles.sliderSection, heightEntry]}>
        <View style={styles.sliderLabelRow}>
          <Text style={styles.fieldLabel}>Height</Text>
          <Text style={styles.heightValue}>{heightCm} cm</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={100}
          maximumValue={220}
          step={1}
          value={heightCm}
          onValueChange={(v) => setHeightCm(Math.round(v))}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.surfaceLight}
          thumbTintColor={colors.primary}
        />
      </Animated.View>

      {/* ── Weight Slider ────────────────────────────────────────── */}
      <Animated.View style={[styles.sliderSection, weightEntry]}>
        <View style={styles.sliderLabelRow}>
          <Text style={styles.fieldLabel}>Weight</Text>
          <Text style={styles.weightValue}>{weightKg} kg</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={30}
          maximumValue={200}
          step={1}
          value={weightKg}
          onValueChange={(v) => setWeightKg(Math.round(v))}
          minimumTrackTintColor={colors.swimmer}
          maximumTrackTintColor={colors.surfaceLight}
          thumbTintColor={colors.swimmer}
        />
      </Animated.View>

      {/* ── Fitness Level Chips ──────────────────────────────────── */}
      <Animated.View style={[styles.chipsSection, fitnessEntry]}>
        <Text style={styles.fieldLabel}>Fitness Level</Text>
        <View style={styles.chipsRow}>
          {FITNESS_OPTIONS.map((option) => {
            const press = chipPressMap[option.value];
            const isSelected = fitnessLevel === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  setFitnessLevel(option.value);
                  clearError('fitnessLevel');
                }}
                onPressIn={press.onPressIn}
                onPressOut={press.onPressOut}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={[
                    styles.chip,
                    isSelected ? styles.chipSelected : styles.chipUnselected,
                    press.animatedStyle,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.fitnessLevel && (
          <Text style={styles.errorText}>{errors.fitnessLevel}</Text>
        )}
      </Animated.View>

      {/* ── Medical Notes ────────────────────────────────────────── */}
      <Animated.View style={[styles.medicalSection, medicalEntry]}>
        <Text style={styles.fieldLabel}>Medical Notes</Text>
        <TextInput
          style={styles.textArea}
          placeholder={
            'Any health conditions your coach\nshould know about? (optional)'
          }
          placeholderTextColor={colors.textDim}
          multiline
          numberOfLines={3}
          maxLength={300}
          value={medicalNotes}
          onChangeText={setMedicalNotes}
          textAlignVertical="top"
        />
        <Text style={styles.charCounter}>
          {medicalNotes.length}/300
        </Text>
      </Animated.View>

    </RegistrationLayout>
  );
};

const styles = StyleSheet.create({
  // ── Slider sections ──────────────────────────────────────────
  sliderSection: {
    marginBottom: spacing.lg,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  heightValue: {
    ...typography.heading,
    color: colors.primary,
  },
  weightValue: {
    ...typography.heading,
    color: colors.swimmer,
  },
  slider: {
    width: '100%',
    height: 40,
  },

  // ── Field label ──────────────────────────────────────────────
  fieldLabel: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── Fitness chips ────────────────────────────────────────────
  chipsSection: {
    marginBottom: spacing.lg,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  chipUnselected: {
    backgroundColor: colors.surfaceLight,
  },
  chipSelected: {
    backgroundColor: colors.swimmer,
  },
  chipText: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: colors.white,
  },

  // ── Medical notes ────────────────────────────────────────────
  medicalSection: {
    marginBottom: spacing.md,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    minHeight: 80,
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
    marginTop: spacing.xs,
  },
  charCounter: {
    ...typography.caption,
    color: colors.textDim,
    textAlign: 'right',
    marginTop: spacing.xs,
  },

  // ── Error text ───────────────────────────────────────────────
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },

});
