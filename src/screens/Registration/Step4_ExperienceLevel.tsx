import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { Icon, IconName } from '../../components/common/Icon';
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
  { id: 'intermediate', label: 'Intermediate', desc: 'Practiced for 1\u20133 years', icon: 'plant-fill' },
  { id: 'advanced', label: 'Advanced', desc: '3+ years, competed before', icon: 'trophy-fill' },
  { id: 'professional', label: 'Professional', desc: 'Competing at high level', icon: 'medal-fill' },
];

const GOALS = ['Get fit', 'Compete', 'Learn basics', 'Have fun', 'Lose weight'];

const FREQUENCIES = ['1\u20132x per week', '3\u20134x per week', 'Daily'];

// ── LevelCard (inline) ──────────────────────────────────────────
function LevelCard({
  item,
  isSelected,
  onPress,
  index,
}: {
  item: typeof LEVELS[number];
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
            styles.levelCard,
            isSelected ? styles.levelCardSelected : styles.levelCardUnselected,
            press.animatedStyle,
          ]}
        >
          <Icon
            name={item.icon}
            size={24}
            color={isSelected ? colors.primary : colors.textDim}
          />
          <View style={styles.levelTextCol}>
            <Text
              style={[
                styles.levelLabel,
                isSelected && styles.levelLabelSelected,
              ]}
            >
              {item.label}
            </Text>
            <Text
              style={[
                styles.levelDesc,
                isSelected && styles.levelDescSelected,
              ]}
            >
              {item.desc}
            </Text>
          </View>
          {isSelected && (
            <Icon name="checkbox-circle-fill" size={20} color={colors.primary} />
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

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
      title="Your Experience"
      subtitle="Help us understand your current level"
      onBack={() => {
        setStep(3);
        navigation.goBack();
      }}
      ctaTitle="Continue"
      onCtaPress={handleContinue}
    >
      {/* ── Skill Level Cards ────────────────────────────────────── */}
      {LEVELS.map((item, index) => (
        <LevelCard
          key={item.id}
          item={item}
          isSelected={level === item.id}
          onPress={() => {
            setLevel(item.id);
            clearError('level');
          }}
          index={index}
        />
      ))}
      {errors.level && (
        <Text style={styles.errorText}>{errors.level}</Text>
      )}

      {/* ── Primary Goal Chips ───────────────────────────────────── */}
      <Animated.View style={[styles.section, goalsEntry]}>
        <Text style={styles.fieldLabel}>What is your main goal?</Text>
        <View style={styles.chipsRow}>
          {GOALS.map((opt) => {
            const isSelected = primaryGoal === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  setPrimaryGoal(opt);
                  clearError('primaryGoal');
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.chip,
                    isSelected
                      ? styles.chipSwimmerSelected
                      : styles.chipUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextWhite,
                    ]}
                  >
                    {opt}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.primaryGoal && (
          <Text style={styles.errorText}>{errors.primaryGoal}</Text>
        )}
      </Animated.View>

      {/* ── Weekly Frequency Chips ───────────────────────────────── */}
      <Animated.View style={[styles.section, freqEntry]}>
        <Text style={styles.fieldLabel}>How often per week?</Text>
        <View style={styles.chipsRow}>
          {FREQUENCIES.map((opt) => {
            const isSelected = weeklyFrequency === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  setWeeklyFrequency(opt);
                  clearError('weeklyFrequency');
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.chip,
                    isSelected
                      ? styles.chipOrangeSelected
                      : styles.chipUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextWhite,
                    ]}
                  >
                    {opt}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.weeklyFrequency && (
          <Text style={styles.errorText}>{errors.weeklyFrequency}</Text>
        )}
      </Animated.View>

    </RegistrationLayout>
  );
};

const styles = StyleSheet.create({
  // ── Level Cards ──────────────────────────────────────────────
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  levelCardUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  levelCardSelected: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  levelTextCol: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  levelLabel: {
    ...typography.bodyMedium,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  levelLabelSelected: {
    color: colors.primary,
  },
  levelDesc: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  levelDescSelected: {
    color: colors.primaryDark,
  },

  // ── Sections ─────────────────────────────────────────────────
  section: {
    marginTop: spacing.md,
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

  // ── Chips ────────────────────────────────────────────────────
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
  chipSwimmerSelected: {
    backgroundColor: colors.swimmer,
  },
  chipOrangeSelected: {
    backgroundColor: colors.orange,
  },
  chipText: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  chipTextWhite: {
    color: colors.white,
  },

  // ── Error ────────────────────────────────────────────────────
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },

});
