import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useBrandingStore } from '../../store/branding.store';
import { lookupClub } from '../../api/services/registration.service';
import {
  getPlatformBranding,
  PlatformBranding,
} from '../../api/services/platform.service';
import { colors, spacing, fontFamily, borderRadius } from '../../theme';
import { applyBrandingColors } from '../../theme/colors';
import { toHex } from '../../services/branding.service';

const FALLBACK_NAME = 'CraveClubs';
const FALLBACK_MARK = 'CC';

/** Initials to show while the platform logo is missing or still loading. */
const markFor = (name: string): string =>
  name.trim().slice(0, 2).toUpperCase() || FALLBACK_MARK;

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
  const [platform, setPlatform] = useState<PlatformBranding | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const setSlug = useBrandingStore((s) => s.setSlug);

  // This screen belongs to CraveClubs, not to any club, so its identity comes
  // from the corporate settings the platform admin controls — the same source
  // the launch splash uses. Without this it inherits whatever club's accent was
  // written into the global `colors` last, and shows that club's color here.
  useEffect(() => {
    let cancelled = false;
    getPlatformBranding()
      .then((cfg) => {
        if (cancelled) return;
        setPlatform(cfg);
        if (cfg.primary_color) {
          applyBrandingColors(
            toHex(cfg.primary_color),
            toHex(cfg.secondary_color ?? cfg.primary_color),
          );
        }
      })
      .catch(() => {
        // Non-critical: the compiled-in platform accent is already in place.
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const platformName = platform?.platform_name?.trim() || FALLBACK_NAME;
  const platformLogo = platform?.platform_logo_url ?? null;

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
          {platformLogo && !logoFailed ? (
            <Image
              source={{ uri: platformLogo }}
              style={styles.logoImage}
              resizeMode="contain"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoText}>{markFor(platformName)}</Text>
            </View>
          )}
          <Text style={styles.title}>{platformName}</Text>
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
  logoImage: {
    width: 120,
    height: 76,
    marginBottom: spacing.lg,
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
