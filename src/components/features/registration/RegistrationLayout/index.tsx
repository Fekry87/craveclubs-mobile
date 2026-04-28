import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../../common/Icon';
import { Button } from '../../../common/Button';
import { RegistrationProgressBar } from '../RegistrationProgressBar';
import { useAnimatedPress } from '../../../../hooks/useAnimatedPress';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface RegistrationLayoutProps {
  currentStep: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  /** Sticky CTA button title (renders sticky footer when provided) */
  ctaTitle?: string;
  /** Sticky CTA press handler */
  onCtaPress?: () => void;
  /** Show loading spinner on CTA */
  ctaLoading?: boolean;
  /** Disable CTA */
  ctaDisabled?: boolean;
  /** CTA button variant */
  ctaVariant?: 'primary' | 'blue' | 'danger' | 'secondary';
}

const TOTAL_STEPS = 8;

export const RegistrationLayout: React.FC<RegistrationLayoutProps> = ({
  currentStep,
  title,
  subtitle,
  onBack,
  children,
  ctaTitle,
  onCtaPress,
  ctaLoading = false,
  ctaDisabled = false,
  ctaVariant = 'primary',
}) => {
  const { animatedStyle, onPressIn, onPressOut } = useAnimatedPress();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Top bar: white with shadow ─────────────────────────── */}
        <View style={styles.topBar}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              activeOpacity={0.7}
            >
              <Animated.View style={[styles.backButton, animatedStyle]}>
                <Icon name="arrow-left-line" size={20} color={colors.text} />
              </Animated.View>
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
          <Text style={styles.stepLabel}>
            Step {currentStep} of {TOTAL_STEPS}
          </Text>
          <View style={styles.backPlaceholder} />
        </View>

        {/* ── Progress bar ──────────────────────────────────────── */}
        <RegistrationProgressBar
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
        />

        {/* ── Scrollable content ────────────────────────────────── */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title + subtitle */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          {children}
        </ScrollView>

        {/* ── Sticky CTA footer ─────────────────────────────────── */}
        {ctaTitle && onCtaPress && (
          <View style={styles.stickyFooter}>
            <Button
              title={ctaTitle}
              onPress={onCtaPress}
              variant={ctaVariant}
              loading={ctaLoading}
              disabled={ctaDisabled}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
