import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { useAuthStore } from '../../store/auth.store';
import { authService } from '../../api/services/auth.service';
import { validateLoginForm } from '../../utils/validators';
import { RootStackParamList } from '../../types/navigation.types';
import { colors, spacing, borderRadius, fontFamily } from '../../theme';

/* ── Platform branding (always shown on login — not club-specific) ── */
const PLATFORM_NAME = 'CraveClubs';
const PLATFORM_TAGLINE = 'Your sports club, in your pocket';
const PLATFORM_INITIALS = 'CC';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, reactivateAccount, isLoginLoading, error, clearError } = useAuthStore();
  const [pendingDeletion, setPendingDeletion] = useState(false);
  const [deletionDaysLeft, setDeletionDaysLeft] = useState(0);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  /* ── Animations ── */
  const markScale = useRef(new Animated.Value(0.7)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(16)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.spring(markScale, {
      toValue: 1,
      speed: 12,
      bounciness: 10,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 450,
        delay: 120,
        useNativeDriver: true,
      }),
      Animated.timing(heroTranslateY, {
        toValue: 0,
        duration: 450,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 500,
        delay: 380,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 500,
        delay: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [markScale, heroOpacity, heroTranslateY, formOpacity, formTranslateY]);

  const handleLogin = async () => {
    clearError();
    setPendingDeletion(false);
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});

    // Check deletion status before login
    try {
      const status = await authService.getDeletionStatus(email);
      if (status.status === 'pending_deletion') {
        setDeletionDaysLeft(status.days_remaining ?? 0);
        setPendingDeletion(true);
        return;
      }
      if (status.status === 'permanently_deleted') {
        useAuthStore.setState({
          error: 'This account has been permanently deleted and cannot be recovered.',
        });
        return;
      }
    } catch {
      // If status check fails (network), proceed with normal login
    }

    try {
      await login(email, password);
    } catch {
      // Error is handled in store
    }
  };

  const handleReactivate = async () => {
    clearError();
    await reactivateAccount(email, password);
  };

  const handleCancelReactivation = () => {
    setPendingDeletion(false);
    clearError();
  };

  const errorBanner = error ? (
    <View style={s.errorBanner}>
      <Icon name="error-warning-fill" size={16} color={colors.error} />
      <Text style={s.errorBannerText}>{error}</Text>
    </View>
  ) : null;

  return (
    <View style={s.root}>
      <KeyboardAvoidingView
        style={s.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero (platform branding) ── */}
          <View style={s.hero}>
            <Animated.View
              style={[
                s.mark,
                { backgroundColor: colors.primary, transform: [{ scale: markScale }] },
              ]}
            >
              <Text style={s.markText}>{PLATFORM_INITIALS}</Text>
            </Animated.View>
            <Animated.View
              style={{
                opacity: heroOpacity,
                transform: [{ translateY: heroTranslateY }],
                alignItems: 'center',
              }}
            >
              <Text style={[s.heroTitle, { color: colors.primary }]}>{PLATFORM_NAME}</Text>
              <Text style={s.heroSubtitle}>{PLATFORM_TAGLINE}</Text>
            </Animated.View>
          </View>

          {/* ── Form ── */}
          <Animated.View
            style={[
              s.form,
              { opacity: formOpacity, transform: [{ translateY: formTranslateY }] },
            ]}
          >
            {pendingDeletion ? (
              <View style={s.reactivation}>
                <View style={s.reactivationIcon}>
                  <Icon name="error-warning-fill" size={28} color={colors.orange} />
                </View>
                <Text style={s.reactivationTitle}>Account pending deletion</Text>
                <Text style={s.reactivationBody}>
                  Your account is scheduled for deletion
                  {deletionDaysLeft > 0
                    ? ` in ${deletionDaysLeft} day${deletionDaysLeft === 1 ? '' : 's'}`
                    : ' today'}
                  . Restore it to keep all your data.
                </Text>
                {errorBanner}
                <Button
                  title="Restore my account"
                  onPress={handleReactivate}
                  loading={isLoginLoading}
                  disabled={isLoginLoading}
                  style={s.primaryButton}
                />
                <TouchableOpacity
                  style={s.textLink}
                  onPress={handleCancelReactivation}
                  activeOpacity={0.7}
                >
                  <Text style={s.textLinkLabel}>Go back</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={s.formTitle}>Welcome back</Text>
                <Text style={s.formSubtitle}>Log in to continue your training</Text>

                {errorBanner}

                <Input
                  label="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors((e) => ({ ...e, email: '' }));
                  }}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />

                <Input
                  label="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors((e) => ({ ...e, password: '' }));
                  }}
                  placeholder="Your password"
                  secureTextEntry
                  error={errors.password}
                />

                <Button
                  title="Log in"
                  onPress={handleLogin}
                  loading={isLoginLoading}
                  disabled={isLoginLoading}
                  style={s.primaryButton}
                />

                <Button
                  title="Create an account"
                  onPress={() => navigation.navigate('Registration')}
                  variant="secondary"
                  style={s.secondaryButton}
                />
              </>
            )}
          </Animated.View>

          <Text style={s.footer}>
            Ask your club manager if you need help signing in.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 88,
    paddingBottom: spacing.xl,
  },

  /* ── Hero ── */
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  mark: {
    width: 76,
    height: 76,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  markText: {
    fontSize: 28,
    fontFamily: fontFamily.headingHeavy,
    color: colors.white,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: fontFamily.headingBold,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  /* ── Form ── */
  form: {
    flexGrow: 1,
  },
  formTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  errorBanner: {
    backgroundColor: colors.errorDim,
    borderRadius: borderRadius.sm,
    padding: spacing.sm + 4,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.bodyMedium,
  },
  primaryButton: {
    marginTop: spacing.sm,
  },
  secondaryButton: {
    marginTop: spacing.sm + 4,
  },
  textLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
  },
  textLinkLabel: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  footer: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: spacing.xl,
  },

  /* ── Reactivation ── */
  reactivation: {
    alignItems: 'center',
  },
  reactivationIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.orangeDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reactivationTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  reactivationBody: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    alignSelf: 'stretch',
  },
});
