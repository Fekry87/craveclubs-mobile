import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useBrandingStore } from '../../store/branding.store';
import { brandingService } from '../../services/branding.service';
import { colors, spacing, fontFamily } from '../../theme';

/**
 * ClubEntryScreen — shown ONLY in shared builds (no baked-in slug).
 * Validates slug via branding API, caches result, then navigates to login.
 */
export const ClubEntryScreen: React.FC = () => {
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setStoreSlug = useBrandingStore((s) => s.setSlug);
  const setBranding = useBrandingStore((s) => s.setBranding);

  const handleContinue = async () => {
    const trimmed = slug.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter your club code');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(trimmed)) {
      setError('Club code can only contain letters, numbers, and hyphens');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate slug + fetch branding (cached with TTL)
      const branding = await brandingService.fetchBranding(trimmed);
      setBranding(branding);
      // Persist slug → triggers navigation to login
      await setStoreSlug(trimmed);
    } catch {
      setError('Club not found. Please check your club code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.surfaceHover]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Logo Area */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>CC</Text>
          </View>
          <Text style={styles.title}>CraveClubs</Text>
          <Text style={styles.subtitle}>Enter your club code to get started</Text>
        </View>

        {/* Input */}
        <View style={styles.form}>
          <Input
            placeholder="e.g. future-academy"
            value={slug}
            onChangeText={(text: string) => {
              setSlug(text);
              setError('');
            }}
            autoCapitalize="none"
            error={error || undefined}
          />

          <Button
            title={loading ? 'Checking...' : 'Continue'}
            onPress={handleContinue}
            disabled={loading}
            style={styles.button}
          />
        </View>

        <Text style={styles.hint}>
          Your club admin should have given you a club code.{'\n'}
          It usually looks like: my-club-name
        </Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontFamily: fontFamily.headingBold,
    fontSize: 28,
    color: colors.white,
  },
  title: {
    fontFamily: fontFamily.headingBold,
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  error: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 13,
    color: colors.error,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
  },
  hint: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 20,
  },
});
