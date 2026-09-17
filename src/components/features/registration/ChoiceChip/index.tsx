import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface ChoiceChipGroupProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  /** Red outline on every chip while nothing is chosen and the step has an error. */
  hasError?: boolean;
}

/**
 * A single-choice row of pills (fitness level, goal, frequency).
 *
 * Replaces chips that turned solid green or orange with white text: the app's
 * design system has one accent for selection, and it is the club's.
 */
export function ChoiceChipGroup<T extends string>({
  options,
  value,
  onChange,
  hasError = false,
}: ChoiceChipGroupProps<T>) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            activeOpacity={0.8}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[
              styles.chip,
              hasError && !value && { borderColor: colors.error },
              selected && [
                styles.chipSelected,
                { borderColor: colors.primary, backgroundColor: colors.primaryDim },
              ],
            ]}
          >
            <Text style={[styles.text, selected && { color: colors.primary }]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
