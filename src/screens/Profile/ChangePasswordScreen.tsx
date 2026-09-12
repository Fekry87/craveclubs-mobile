import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/auth.store';
import { colors, spacing, fontFamily } from '../../theme';

type ApiError = {
  response?: {
    data?: { message?: string; errors?: Record<string, string[]> };
  };
};

/**
 * Put a server error on the field it is actually about.
 *
 * Every failure used to land under "Current password", so a rejected *new*
 * password read as "the password you were given is wrong" — which is what sends
 * people back to their club for another reset that was never needed.
 */
const toFieldErrors = (err: unknown): Record<string, string> => {
  const data = (err as ApiError).response?.data;
  const validation = data?.errors;

  if (validation) {
    const out: Record<string, string> = {};
    if (validation.current_password?.[0]) out.current = validation.current_password[0];
    if (validation.new_password?.[0]) out.next = validation.new_password[0];
    if (Object.keys(out).length > 0) return out;
  }

  const message = data?.message;
  if (!message) {
    return { form: 'Could not change your password. Please try again.' };
  }
  if (/current password/i.test(message)) {
    return {
      current:
        "That password doesn't match the account you're signed in as. Check the account below, or ask your club to reset it.",
    };
  }
  if (/new password/i.test(message)) {
    return { next: message };
  }
  return { form: message };
};

export const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const changePassword = useAuthStore((st) => st.changePassword);
  const account = useAuthStore((st) => st.user?.email ?? null);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Any keystroke means the user is acting on the feedback — drop the field's own
  // error and the form-level one with it, so a stale banner can't outlive the edit.
  const clearError = useCallback((field: string) => {
    setErrors((e) =>
      e[field] || e.form ? { ...e, [field]: '', form: '' } : e,
    );
  }, []);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!current) e.current = 'Enter your current password';
    if (next.length < 8) e.next = 'New password must be at least 8 characters';
    if (next && current && next === current)
      e.next = 'New password must be different';
    if (confirm !== next) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [current, next, confirm]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await changePassword(current, next);
      Alert.alert('Done', 'Your password has been changed.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: unknown) {
      setErrors(toFieldErrors(err));
    } finally {
      setSubmitting(false);
    }
  }, [validate, changePassword, current, next, navigation]);

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={s.flex}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.hint}>
          Choose a new password you'll remember. You'll stay signed in on this
          device; other devices will need the new password.
        </Text>

        <Input
          label="Current password"
          value={current}
          onChangeText={(t) => {
            setCurrent(t);
            clearError('current');
          }}
          placeholder="Current password"
          secureTextEntry
          autoCapitalize="none"
          error={errors.current}
        />

        <Input
          label="New password"
          value={next}
          onChangeText={(t) => {
            setNext(t);
            clearError('next');
          }}
          placeholder="At least 8 characters"
          secureTextEntry
          autoCapitalize="none"
          error={errors.next}
        />

        <Input
          label="Confirm new password"
          value={confirm}
          onChangeText={(t) => {
            setConfirm(t);
            clearError('confirm');
          }}
          placeholder="Re-enter new password"
          secureTextEntry
          autoCapitalize="none"
          error={errors.confirm}
        />

        {!!errors.form && <Text style={s.formError}>{errors.form}</Text>}

        {!!account && (
          <View style={s.account}>
            <Text style={s.accountLabel}>Signed in as</Text>
            <Text style={s.accountValue} selectable>
              {account}
            </Text>
            <Text style={s.accountHint}>
              Your club sees this same address when it resets your password. If it
              doesn't match the one they gave you, sign out and sign in again with
              those details.
            </Text>
          </View>
        )}

        <View style={s.spacer} />

        <Button
          title="Change password"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  spacer: {
    height: spacing.sm,
  },
  formError: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.bodyMedium,
    color: colors.error,
    marginBottom: spacing.md,
  },
  account: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  accountLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  accountValue: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  accountHint: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
