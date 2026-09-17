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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useBrandingStore } from '../../store/branding.store';
import { lookupClub } from '../../api/services/registration.service';
import {
  getPlatformBranding,
  PlatformBranding,
} from '../../api/services/platform.service';
import { colors, spacing, fontFamily, typography } from '../../theme';
import { applyBrandingColors } from '../../theme/colors';
import { toHex } from '../../services/branding.service';

const FALLBACK_NAME = 'CraveClubs';
const FALLBACK_MARK = 'CC';

/**
 * The logo is a small header mark in the top-left corner, drawn inside this box
 * at its own aspect ratio — never stretched into a fixed frame, which leaves
 * dead space around a wide wordmark. A wordmark hits the width cap (~112×19),
 * a square mark the height cap (32×32). The headline carries the screen; the
 * logo only signs it.
 */
const LOGO_MAX_WIDTH = 112;
const LOGO_MAX_HEIGHT = 32;

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
  const insets = useSafeAreaInsets();
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
        contentContainerStyle={[
          styles.inner,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Brand: a small mark in the corner ── */}
        <View style={styles.brandRow}>
          {platformLogo && !logoFailed ? (
            logoAspect ? (
              <Image
                source={{ uri: platformLogo }}
                style={logoSize(logoAspect)}
                resizeMode="contain"
                onError={() => setLogoFailed(true)}
                accessibilityLabel={platformName}
              />
            ) : (
              // Hold the mark's slot while the logo is measured, so nothing jumps.
              <View style={styles.logoPlaceholder} />
            )
          ) : (
            <>
              <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
                <Text style={styles.logoText}>{markFor(platformName)}</Text>
              </View>
              <Text style={styles.brandName} numberOfLines={1}>
                {platformName}
              </Text>
            </>
          )}
        </View>

        {/* ── The task, stated big, in the middle ── */}
        <View style={styles.statement}>
          {platformLogo && !logoFailed ? (
            // With a logo up top, the platform name reads as its line: the
            // admin's slogan ("Your way to the top") sits above the task.
            <Text style={styles.eyebrow}>{platformName}</Text>
          ) : null}
          <Text style={styles.headline} accessibilityRole="header">
            {'Find your\nclub'}
          </Text>
          <Text style={styles.subtitle}>
            Enter its name to sign in or join.
          </Text>
        </View>

        {/* ── The form, where the thumb is ── */}
        <View>
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
          />

          <Text style={styles.hint}>Ask your club for its exact name</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/**
 * Thumb-zone layout: brand mark pinned to the top, the field and button pinned
 * to the bottom where a thumb reaches them, and the task stated as one big
 * headline sitting directly on top of that form — it introduces the field, so
 * it belongs with it, and the empty canvas stays above rather than splitting
 * the two. On the 8pt grid:
 *   eyebrow → headline       8
 *   headline → instruction  12
 *   instruction → field     48
 *   field → button          16  (Input leaves it below itself)
 *   button → help           16
 * The top flexes, so the layout holds on any screen height and simply scrolls
 * when the keyboard takes the room.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: LOGO_MAX_HEIGHT,
  },
  logoPlaceholder: {
    height: LOGO_MAX_HEIGHT,
  },
  logoMark: {
    width: LOGO_MAX_HEIGHT,
    height: LOGO_MAX_HEIGHT,
    // Same corner proportion as an app icon, so the mark reads as one.
    borderRadius: LOGO_MAX_HEIGHT * 0.28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: fontFamily.headingHeavy,
    fontSize: 13,
    color: colors.white,
    letterSpacing: 0.5,
  },
  brandName: {
    ...typography.bodyMedium,
    color: colors.text,
    flexShrink: 1,
  },
  statement: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  eyebrow: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  headline: {
    ...typography.display,
    color: colors.text,
    letterSpacing: -0.8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm + 4,
  },
  hint: {
    ...typography.caption,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
