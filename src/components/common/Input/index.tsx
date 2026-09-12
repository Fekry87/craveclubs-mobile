import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ViewStyle,
  KeyboardTypeOptions,
} from 'react-native';
import { Icon } from '../Icon';
import { colors } from '../../../theme';
import { styles } from './styles';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  style?: ViewStyle;
  editable?: boolean;
}

/**
 * Field with the label rendered inside the box above the value
 * (floating-label style). Focus ring uses the brand color.
 */
export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  style,
  editable = true,
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.field,
          focused && [styles.fieldFocused, { borderColor: colors.primary }],
          error ? styles.fieldError : undefined,
          !editable && styles.fieldDisabled,
        ]}
      >
        <View style={styles.fieldBody}>
          {label && (
            <Text style={[styles.label, focused && { color: colors.primary }]}>
              {label}
            </Text>
          )}
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textDim}
            secureTextEntry={secureTextEntry && !showPassword}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            // Tapping "Show" turns secureTextEntry off, which re-arms iOS
            // autocorrect over the field — it would silently rewrite a password
            // as the user typed it. Keep both off for the life of a secure field.
            autoCorrect={secureTextEntry ? false : undefined}
            spellCheck={secureTextEntry ? false : undefined}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            editable={editable}
            accessibilityLabel={label}
          />
        </View>
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.trailing}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Text style={styles.trailingText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        )}
        {!!error && (
          <View style={styles.trailing}>
            <Icon name="error-warning-fill" size={18} color={colors.error} />
          </View>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};
