import React, { useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { SelectCard } from '../../components/features/registration/SelectCard';
import { ChoiceChipGroup } from '../../components/features/registration/ChoiceChip';
import { SectionLabel, FieldError } from '../../components/features/registration/SectionLabel';
import { Icon, IconName } from '../../components/common/Icon';
import { useRegistrationStore } from '../../store/registration.store';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { colors, spacing, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step4_ExperienceLevel'
>;

type LevelId = 'beginner' | 'intermediate' | 'advanced' | 'professional';

const LEVELS: {
  id: LevelId;
  label: string;
  desc: string;
  icon: IconName;
}[] = [
  { id: 'beginner', label: 'Beginner', desc: 'Just starting out', icon: 'seedling-fill' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Practised for 1\u20133 years', icon: 'plant-fill' },
  { id: 'advanced', label: 'Advanced', desc: '3+ years, competed before', icon: 'trophy-fill' },
  { id: 'professional', label: 'Professional', desc: 'Competing at a high level', icon: 'medal-fill' },
];

// The values are what the club sees in the portal, so they stay as they were.
const GOALS = ['Get fit', 'Compete', 'Learn basics', 'Have fun', 'Lose weight'].map(
  (g) => ({ value: g, label: g }),
);

const FREQUENCIES = ['1\u20132x per week', '3\u20134x per week', 'Daily'].map((f) => ({
  value: f,
  label: f,
}));

// ── Main Screen ─────────────────────────────────────────────────
export const Step4_ExperienceLevel: React.FC<Props> = ({ navigation }) => {
  const { experience, updateExperience, setStep } =
    useRegistrationStore();

  // ── Local state (rehydrate from store) ───────────────────────
  const [level, setLevel] = useState<LevelId | null>(
    experience.level ?? null,
  );
  const [primaryGoal, setPrimaryGoal] = useState<string | null>(
    experience.primaryGoal ?? null,
  );
  const [weeklyFrequency, setWeeklyFrequency] = useState<string | null>(
    experience.weeklyFrequency ?? null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Animations ───────────────────────────────────────────────
  const goalsEntry = useAnimatedEntry(4);
  const freqEntry = useAnimatedEntry(5);

  // ── Clear error helper ───────────────────────────────────────
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
    if (!level) errs.level = 'Please select your skill level';
    if (!primaryGoal) errs.primaryGoal = 'Please select your main goal';
    if (!weeklyFrequency)
      errs.weeklyFrequency = 'Please select weekly frequency';
    return errs;
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleContinue = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    updateExperience({
      level,
      primaryGoal,
      weeklyFrequency,
    });
    setStep(5);
    navigation.navigate('Step5_BranchSelection');
  };

  return (
    <RegistrationLayout
      currentStep={4}
      title="Your experience"
      subtitle="Help us understand your current level"
      onBack={() => {
        setStep(3);
        navigation.goBack();
      }}
      ctaTitle="Continue"
      onCtaPress={handleContinue}
    >
      {/* ── Skill level ──────────────────────────────────────────── */}
      <SectionLabel>Skill level</SectionLabel>
      {LEVELS.map((item, index) => {
        const selected = level === item.id;
        return (
          <SelectCard
            key={item.id}
            title={item.label}
            subtitle={item.desc}
            selected={selected}
            index={index}
            onPress={() => {
              setLevel(item.id);
              clearError('level');
            }}
            leading={
              <View
                style={[
                  styles.iconTile,
                  { backgroundColor: selected ? colors.white : colors.surfaceLight },
                ]}
              >
                <Icon
                  name={item.icon}
                  size={22}
                  color={selected ? colors.primary : colors.textMuted}
                />
              </View>
            }
          />
        );
      })}
      <FieldError message={errors.level} />

      {/* ── Main goal ────────────────────────────────────────────── */}
      <Animated.View style={[styles.section, goalsEntry]}>
        <SectionLabel>What's your main goal?</SectionLabel>
        <ChoiceChipGroup
          options={GOALS}
          value={primaryGoal}
          onChange={(value) => {
            setPrimaryGoal(value);
            clearError('primaryGoal');
          }}
          hasError={!!errors.primaryGoal}
        />
        <FieldError message={errors.primaryGoal} />
      </Animated.View>

      {/* ── Weekly frequency ─────────────────────────────────────── */}
      <Animated.View style={[styles.section, freqEntry]}>
        <SectionLabel>How often can you train?</SectionLabel>
        <ChoiceChipGroup
          options={FREQUENCIES}
          value={weeklyFrequency}
          onChange={(value) => {
            setWeeklyFrequency(value);
            clearError('weeklyFrequency');
          }}
          hasError={!!errors.weeklyFrequency}
        />
        <FieldError message={errors.weeklyFrequency} />
      </Animated.View>
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
  section: {
    marginTop: spacing.lg,
  },
});
