import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useBrandingStore } from '../../store/branding.store';
import { lookupClub } from '../../api/services/registration.service';
import { colors, spacing, fontFamily, borderRadius } from '../../theme';

const PLATFORM_NAME = 'CraveClubs';
const PLATFORM_MARK = 'CC';

/**
 * First screen of a shared build: the swimmer types their own club's name.
 *
 * It deliberately does not list the clubs on the platform. A swimmer belongs to
 * one club and has no reason to see the others, so the name is resolved by an
 * exact-match lookup on the server instead of by filtering a list the app
 * downloaded. Resolving sets the branding slug, which flips `isResolved` and
 * lets RootNavigator render the club-branded login — there is no navigate()
 * call here.
 */
export const ClubEntryScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setSlug = useBrandingStore((s) => s.setSlug);

  const handleContinue = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError('Enter your club name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const club = await lookupClub(trimmed);
      if (!club) {
        setError(
          "We couldn't find a club with that name. Check the spelling with your club.",
        );
        return;
      }
      await setSlug(club.slug);
    } catch {
      setError('Something went wrong. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [query, setSlug]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoArea}>
          <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>{PLATFORM_MARK}</Text>
          </View>
          <Text style={styles.title}>{PLATFORM_NAME}</Text>
          <Text style={styles.subtitle}>
            Enter your club's name to sign in or create an account.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Club name"
            placeholder="e.g. Smart Club"
            value={query}
            onChangeText={(text: string) => {
              setQuery(text);
              if (error) setError('');
            }}
            autoCapitalize="words"
            error={error || undefined}
          />

          <Button
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            disabled={loading}
            style={styles.button}
          />
        </View>

        <Text style={styles.hint}>
          Type the name exactly as your club wrote it. If it doesn't work, ask
          your club which name to use.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoMark: {
    width: 76,
    height: 76,
    borderRadius: borderRadius.modal - 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoText: {
    fontFamily: fontFamily.headingHeavy,
    fontSize: 28,
    color: colors.white,
    letterSpacing: 1,
  },
  title: {
    fontFamily: fontFamily.headingBold,
    fontSize: 30,
    lineHeight: 36,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.sm,
  },
  hint: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 20,
  },
});
