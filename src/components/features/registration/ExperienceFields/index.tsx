import React from 'react';
import { View } from 'react-native';
import { SelectCard } from '../SelectCard';
import { ChoiceChipGroup } from '../ChoiceChip';
import { SectionLabel, FieldError } from '../SectionLabel';
import { Icon, IconName } from '../../../common/Icon';
import { ExperienceValues, FieldErrors } from '../../../../utils/registrationValidation';
import { colors } from '../../../../theme';
import { styles } from './styles';

type LevelId = NonNullable<ExperienceValues['level']>;

const LEVELS: { id: LevelId; label: string; desc: string; icon: IconName }[] = [
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

interface ExperienceFieldsProps {
  value: ExperienceValues;
  onChange: (patch: Partial<ExperienceValues>) => void;
  errors: FieldErrors;
}

/**
 * Skill level, main goal and weekly frequency — Step 4's questions, also used
 * by the review screen's edit sheet.
 */
export const ExperienceFields: React.FC<ExperienceFieldsProps> = ({
  value,
  onChange,
  errors,
}) => (
  <View>
    <SectionLabel>Skill level</SectionLabel>
    {LEVELS.map((item, index) => {
      const selected = value.level === item.id;
      return (
        <SelectCard
          key={item.id}
          title={item.label}
          subtitle={item.desc}
          selected={selected}
          index={index}
          onPress={() => onChange({ level: item.id })}
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

    <View style={styles.section}>
      <SectionLabel>What's your main goal?</SectionLabel>
      <ChoiceChipGroup
        options={GOALS}
        value={value.primaryGoal}
        onChange={(primaryGoal) => onChange({ primaryGoal })}
        hasError={!!errors.primaryGoal}
      />
      <FieldError message={errors.primaryGoal} />
    </View>

    <View style={styles.section}>
      <SectionLabel>How often can you train?</SectionLabel>
      <ChoiceChipGroup
        options={FREQUENCIES}
        value={value.weeklyFrequency}
        onChange={(weeklyFrequency) => onChange({ weeklyFrequency })}
        hasError={!!errors.weeklyFrequency}
      />
      <FieldError message={errors.weeklyFrequency} />
    </View>
  </View>
);
