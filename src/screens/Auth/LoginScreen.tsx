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
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { useAuthStore } from '../../store/auth.store';
import { authService } from '../../api/services/auth.service';
import { validateLoginForm } from '../../utils/validators';
import { RootStackParamList } from '../../types/navigation.types';
import { colors, spacing, borderRadius, fontFamily, shadows } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ── Platform branding (always shown on login — not club-specific) ── */
const PLATFORM_NAME = 'CraveClubs';
const PLATFORM_TAGLINE = 'Your Sports Club Platform';
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
  const badgeScale = useRef(new Animated.Value(0)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(20)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  const decorScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Badge bounce in
    Animated.spring(badgeScale, {
      toValue: 1,
      tension: 50,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // Hero fade in
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(heroTranslateY, {
        toValue: 0,
        duration: 500,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Decorative circles
    Animated.spring(decorScale, {
      toValue: 1,
      tension: 25,
      friction: 8,
      delay: 100,
      useNativeDriver: true,
    }).start();

    // Form slide up
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 600,
        delay: 550,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    badgeScale,
    heroOpacity, heroTranslateY,
    formOpacity, formTranslateY,
    decorScale,
  ]);

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

  return (
    <View style={s.root}>
      <LinearGradient
        colors={['#1CB0F6', '#1899D6', colors.swimmerDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={s.gradient}
      >
        {/* Decorative circles */}
        <Animated.View
          style={[s.decorCircle1, { transform: [{ scale: decorScale }] }]}
        />
        <Animated.View
          style={[s.decorCircle2, { transform: [{ scale: decorScale }] }]}
        />
        <Animated.View
          style={[s.decorCircle3, { transform: [{ scale: decorScale }] }]}
        />

        <KeyboardAvoidingView
          style={s.flex1}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={s.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Hero section (platform branding) ── */}
            <View style={s.heroSection}>
              {/* Platform badge */}
              <Animated.View
                style={[s.badgeWrapper, { transform: [{ scale: badgeScale }] }]}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.08)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.badge}
                >
                  <Text style={s.badgeText}>{PLATFORM_INITIALS}</Text>
                </LinearGradient>
              </Animated.View>

              {/* Title */}
              <Animated.View
                style={[
                  s.titleWrapper,
                  {
                    opacity: heroOpacity,
                    transform: [{ translateY: heroTranslateY }],
                  },
                ]}
              >
                <Text style={s.heroTitle}>{PLATFORM_NAME}</Text>
                <Text style={s.heroSubtitle}>{PLATFORM_TAGLINE}</Text>
              </Animated.View>
            </View>

            {/* ── Form card (centered box) ── */}
            <Animated.View
              style={[
                s.formCard,
                {
                  opacity: formOpacity,
                  transform: [{ translateY: formTranslateY }],
                },
              ]}
            >
              {pendingDeletion ? (
                /* ── Reactivation prompt ── */
                <View style={s.reactivationContainer}>
                  <View style={s.reactivationIconCircle}>
                    <Icon name="error-warning-fill" size={28} color={colors.orange} />
                  </View>
                  <Text style={s.reactivationTitle}>
                    Account Pending Deletion
                  </Text>
                  <Text style={s.reactivationBody}>
                    Your account is scheduled for deletion
                    {deletionDaysLeft > 0
                      ? ` in ${deletionDaysLeft} day${deletionDaysLeft === 1 ? '' : 's'}`
                      : ' today'}
                    . Would you like to restore your account and all your data?
                  </Text>

                  {error && (
                    <View style={s.errorBanner}>
                      <Icon name="error-warning-line" size={16} color={colors.error} />
                      <Text style={s.errorBannerText}>{error}</Text>
                    </View>
                  )}

                  <Button
                    title="Restore My Account"
                    onPress={handleReactivate}
                    loading={isLoginLoading}
                    disabled={isLoginLoading}
                    style={s.button}
                  />

                  <TouchableOpacity
                    style={s.registerLink}
                    onPress={handleCancelReactivation}
                    activeOpacity={0.7}
                  >
                    <Text style={s.reactivationBackText}>Go Back</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* ── Normal login form ── */
                <>
                  <Text style={s.formTitle}>Welcome Back</Text>
                  <Text style={s.formSubtitle}>
                    Sign in to continue your journey
                  </Text>

                  {error && (
                    <View style={s.errorBanner}>
                      <Icon
                        name="error-warning-line"
                        size={16}
                        color={colors.error}
                      />
                      <Text style={s.errorBannerText}>{error}</Text>
                    </View>
                  )}

                  <Input
                    label="Email"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) setErrors((e) => ({ ...e, email: '' }));
                    }}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                  />

                  <Input
                    label="Password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password)
                        setErrors((e) => ({ ...e, password: '' }));
                    }}
                    placeholder="Enter your password"
                    secureTextEntry
                    error={errors.password}
                  />

                  <Button
                    title="Let's Go!"
                    onPress={handleLogin}
                    loading={isLoginLoading}
                    disabled={isLoginLoading}
                    style={s.button}
                  />

                  {/* ── Register link ── */}
                  <TouchableOpacity
                    style={s.registerLink}
                    onPress={() => navigation.navigate('Registration')}
                    activeOpacity={0.7}
                  >
                    <Text style={s.registerText}>
                      New here?{' '}
                      <Text style={s.registerTextBold}>Register</Text>
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const s = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.xl,
  },

  /* ── Decorative circles ── */
  decorCircle1: {
    position: 'absolute',
    top: -SCREEN_WIDTH * 0.2,
    right: -SCREEN_WIDTH * 0.15,
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: SCREEN_WIDTH * 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -SCREEN_WIDTH * 0.1,
    left: -SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    borderRadius: SCREEN_WIDTH * 0.25,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  decorCircle3: {
    position: 'absolute',
    top: '40%',
    right: -SCREEN_WIDTH * 0.05,
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_WIDTH * 0.3,
    borderRadius: SCREEN_WIDTH * 0.15,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },

  /* ── Hero section ── */
  heroSection: {
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },

  /* Platform badge */
  badgeWrapper: {
    marginBottom: spacing.md,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeText: {
    fontSize: 22,
    fontFamily: fontFamily.headingHeavy,
    color: colors.white,
  },

  /* Title */
  titleWrapper: {
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: fontFamily.headingHeavy,
    color: colors.white,
    textAlign: 'left',
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: fontFamily.bodyMedium,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: spacing.xs,
    textAlign: 'left',
  },

  /* ── Form card ── */
  formCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.modal,
    padding: spacing.lg,
    ...shadows.lg,
  },
  formTitle: {
    fontSize: 22,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  errorBanner: {
    backgroundColor: colors.errorDim,
    borderWidth: 1,
    borderColor: colors.error + '4D',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    color: colors.error,
    fontSize: 13,
    fontFamily: fontFamily.bodyMedium,
  },
  button: {
    marginTop: spacing.md,
  },

  /* ── Register link ── */
  registerLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
  },
  registerText: {
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },
  registerTextBold: {
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },

  /* ── Reactivation prompt ── */
  reactivationContainer: {
    alignItems: 'center',
  },
  reactivationIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.orangeDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reactivationTitle: {
    fontSize: 18,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  reactivationBody: {
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  reactivationBackText: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
});
