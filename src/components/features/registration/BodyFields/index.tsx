import React from 'react';
import { View, Text, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import { ChoiceChipGroup } from '../ChoiceChip';
import { SectionLabel, FieldError } from '../SectionLabel';
import { BodyValues, FieldErrors } from '../../../../utils/registrationValidation';
import { colors } from '../../../../theme';
import { styles } from './styles';

type FitnessLevel = NonNullable<BodyValues['fitnessLevel']>;

// Least to most, the order people think in.
const FITNESS_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'average', label: 'Average' },
  { value: 'good', label: 'Good' },
  { value: 'excellent', label: 'Excellent' },
] as const satisfies readonly { value: FitnessLevel; label: string }[];

const MEDICAL_MAX = 300;

interface BodyFieldsProps {
  value: BodyValues;
  onChange: (patch: Partial<BodyValues>) => void;
  errors: FieldErrors;
}

function Measure({
  label,
  unit,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.measureCard}>
      <View style={styles.measureHeader}>
        <Text style={styles.measureLabel}>{label}</Text>
        <Text style={styles.measureValue}>
          {value}
          <Text style={styles.measureUnit}> {unit}</Text>
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={1}
        value={value}
        onValueChange={(v) => onChange(Math.round(v))}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        accessibilityLabel={`${label} in ${unit}`}
      />
      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>{min}</Text>
        <Text style={styles.rangeText}>{max}</Text>
      </View>
    </View>
  );
}

/**
 * Height, weight, fitness level and medical notes — Step 2's questions, also
 * used by the review screen's edit sheet.
 */
export const BodyFields: React.FC<BodyFieldsProps> = ({ value, onChange, errors }) => (
  <View>
    <Measure
      label="Height"
      unit="cm"
      value={value.heightCm}
      min={100}
      max={220}
      onChange={(heightCm) => onChange({ heightCm })}
    />
    <Measure
      label="Weight"
      unit="kg"
      value={value.weightKg}
      min={30}
      max={200}
      onChange={(weightKg) => onChange({ weightKg })}
    />

    <View style={styles.section}>
      <SectionLabel>Fitness level</SectionLabel>
      <ChoiceChipGroup
        options={FITNESS_OPTIONS}
        value={value.fitnessLevel}
        onChange={(fitnessLevel) => onChange({ fitnessLevel })}
        hasError={!!errors.fitnessLevel}
      />
      <FieldError message={errors.fitnessLevel} />
    </View>

    <View style={styles.section}>
      <SectionLabel hint="Optional">Medical notes</SectionLabel>
      <TextInput
        style={styles.textArea}
        placeholder="Anything your coach should know, e.g. asthma or a recent injury"
        placeholderTextColor={colors.textDim}
        multiline
        maxLength={MEDICAL_MAX}
        value={value.medicalNotes}
        onChangeText={(medicalNotes) => onChange({ medicalNotes })}
        textAlignVertical="top"
        accessibilityLabel="Medical notes"
      />
      <Text style={styles.charCounter}>
        {value.medicalNotes.length}/{MEDICAL_MAX}
      </Text>
    </View>
  </View>
);
