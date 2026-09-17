import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

interface SectionLabelProps {
  children: string;
  /** Right-aligned note, e.g. a live value or "Optional". */
  hint?: React.ReactNode;
}

/** Sentence-case label above a group of choices — never uppercase. */
export const SectionLabel: React.FC<SectionLabelProps> = ({ children, hint }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{children}</Text>
    {typeof hint === 'string' ? <Text style={styles.hint}>{hint}</Text> : hint}
  </View>
);

/** The inline error under a field or group, in the same place on every step. */
export const FieldError: React.FC<{ message?: string | null }> = ({ message }) =>
  message ? <Text style={styles.error}>{message}</Text> : null;
