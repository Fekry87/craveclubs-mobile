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
import { colors, spacing, fontFamily, borderRadius, typography } from '../../theme';
import { applyBrandingColors } from '../../theme/colors';
import { toHex } from '../../services/branding.service';

const FALLBACK_NAME = 'CraveClubs';
const FALLBACK_MARK = 'CC';

/**
 * The logo is drawn inside this box at its own aspect ratio, never stretched
 * into a fixed frame. A fixed 120×76 frame with `contain` rendered a wide
 * wordmark ~20pt tall with dead space above and below it — which read as a
 * large, uneven gap under the logo. Wide marks hit the width cap (so a wordmark
 * is ~160×27, leading the headline without outweighing it); square marks hit
 * the height cap (64×64).
 */
const LOGO_MAX_WIDTH = 160;
const LOGO_MAX_HEIGHT = 64;

const logoSize = (aspectRatio: number) => {
  const width = Math.min(LOGO_MAX_WIDTH, LOGO_MAX_HEIGHT * aspectRatio);
  return { width, height: width / aspectRatio };
};

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
  // Measured from the image itself; null until known.
  const [logoAspect, setLogoAspect] = useState<number | null>(null);
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

  useEffect(() => {
    if (!platformLogo) return;
    let cancelled = false;
    Image.getSize(
      platformLogo,
      (w, h) => {
        if (!cancelled && w > 0 && h > 0) setLogoAspect(w / h);
      },
      () => {
        if (!cancelled) setLogoFailed(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [platformLogo]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          {platformLogo && !logoFailed ? (
            logoAspect ? (
              <Image
                source={{ uri: platformLogo }}
                style={[styles.logo, logoSize(logoAspect)]}
                resizeMode="contain"
                onError={() => setLogoFailed(true)}
                accessibilityLabel={platformName}
              />
            ) : (
              // Hold the logo's slot while it is measured, so nothing jumps.
              <View style={styles.logoPlaceholder} />
            )
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
          {"Type the name exactly as your club wrote it.\nIf it doesn't work, ask your club which name to use."}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/**
 * Hierarchy, top to bottom: brand mark → headline → instruction → field →
 * button → help. Spacing is on the 8pt grid and says what belongs together:
 *   mark → headline        32  (the mark heads the screen, set apart)
 *   headline → instruction  8  (one thought)
 *   instruction → field    32  (reading ends, doing starts)
 *   field → button         16
 *   button → help          24
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    // More room below than above lifts the group to the optical centre, a
    // little above the true middle, where a centred block looks centred.
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    marginBottom: spacing.xl,
  },
  logoPlaceholder: {
    height: LOGO_MAX_HEIGHT / 2,
    marginBottom: spacing.xl,
  },
  logoMark: {
    width: LOGO_MAX_HEIGHT,
    height: LOGO_MAX_HEIGHT,
    borderRadius: borderRadius.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    fontFamily: fontFamily.headingHeavy,
    fontSize: 24,
    color: colors.white,
    letterSpacing: 1,
  },
  title: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    // Keeps the line break balanced instead of stranding "account." alone.
    maxWidth: 280,
  },
  form: {
    marginBottom: spacing.lg,
  },
  button: {
    // Input already leaves spacing.md below itself.
    marginTop: 0,
  },
  hint: {
    ...typography.caption,
    color: colors.textDim,
    textAlign: 'center',
  },
});
