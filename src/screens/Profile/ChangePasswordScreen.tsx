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

export const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const changePassword = useAuthStore((st) => st.changePassword);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const message =
        axiosErr.response?.data?.message ||
        'Could not change your password. Please try again.';
      setErrors({ current: message });
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
            if (errors.current) setErrors((e) => ({ ...e, current: '' }));
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
            if (errors.next) setErrors((e) => ({ ...e, next: '' }));
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
            if (errors.confirm) setErrors((e) => ({ ...e, confirm: '' }));
          }}
          placeholder="Re-enter new password"
          secureTextEntry
          autoCapitalize="none"
          error={errors.confirm}
        />

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
});
