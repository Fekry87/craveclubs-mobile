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
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { PhotoSlideshow } from '../../components/features/auth/PhotoSlideshow';
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
// Stable empty list, so the slideshow doesn't restart on every render.
const NO_PHOTOS: string[] = [];

/**
 * Overhead butterfly stroke — Luckas Spalinger on Unsplash, used under the
 * Unsplash License. Portrait, with darker water at the top and bottom where the
 * logo and the form sit. The platform admin can replace it with up to three
 * photos from corporate settings; this one stays as the fallback while they
 * load and when none are uploaded.
 */
const HERO = require('../../../assets/images/swim-hero.jpg');

/**
 * The photo is lifted by this share of the screen height. Drawn edge to edge,
 * the swimmer landed right under the headline and the white splash swallowed
 * the text; lifted, the swimmer sits mid-screen and the dark water below takes
 * the text.
 */
const HERO_LIFT = 0.24;

/** Deep water: the scrim's end and the screen background below the photo. */
const DEEP_WATER = '#031116';

/**
 * Legibility scrim over the photo, tinted to the water's deep teal rather than
 * flat black so it reads as part of the image. Light through the middle, where
 * the swimmer is, then darkening under the text and reaching fully opaque
 * exactly where the lifted photo ends — so its bottom edge can never show as a
 * line against the background.
 */
const SCRIM = [
  // Heavier at the very top: the splash spray reaches up behind the logo.
  'rgba(3, 17, 22, 0.75)',
  'rgba(3, 17, 22, 0.05)',
  'rgba(3, 17, 22, 0.35)',
  DEEP_WATER,
  DEEP_WATER,
] as const;
const SCRIM_STOPS = [0, 0.3, 0.5, 1 - HERO_LIFT, 1] as const;

/**
 * The logo sits centred at the top, drawn at its own aspect ratio inside this
 * box: a wordmark hits the width cap (~184×28), a square mark the height cap.
 */
const LOGO_MAX_WIDTH = 184;
const LOGO_MAX_HEIGHT = 40;

const logoSize = (aspectRatio: number) => {
  const width = Math.min(LOGO_MAX_WIDTH, LOGO_MAX_HEIGHT * aspectRatio);
  return { width, height: width / aspectRatio };
};

/**
 * First screen of a shared build: the swimmer types their own club's name.
 *
 * It deliberately does not list the clubs on the platform. A swimmer belongs to
 * one club and has no reason to see the others, so the name is resolved by an
 * exact-match lookup on the server instead of by filtering a list the app
 * downloaded. Resolving sets the branding slug, which flips `isResolved` and
 * lets RootNavigator render the club-branded login — there is no navigate()
 * call here.
 *
 * Layout: a full-bleed swimming photo with the platform logo centred at the
 * top, and the task — headline, field, button — anchored to the bottom where
 * the thumb is.
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

  // On the dark photo the mark must be white. The uploaded platform logo is a
  // transparent PNG, so it is tinted white. Without one, the splash image — which
  // is authored white-on-dark already — is used as is.
  const brand = platform?.platform_logo_url
    ? { uri: platform.platform_logo_url, tint: true }
    : platform?.splash_image_url
      ? { uri: platform.splash_image_url, tint: false }
      : null;

  useEffect(() => {
    setLogoAspect(null);
    setLogoFailed(false);
    if (!brand) return;
    let cancelled = false;
    Image.getSize(
      brand.uri,
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
  }, [brand?.uri]);

  const showImageMark = !!brand && !logoFailed;
  const entryPhotos = platform?.entry_photo_urls ?? NO_PHOTOS;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <PhotoSlideshow photos={entryPhotos} fallback={HERO} lift={HERO_LIFT} />
      <LinearGradient
        colors={SCRIM}
        locations={SCRIM_STOPS}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.inner,
            {
              paddingTop: insets.top + spacing.lg,
              paddingBottom: insets.bottom + spacing.md,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Brand, centred at the top ── */}
          <View style={styles.brand}>
            {showImageMark ? (
              logoAspect ? (
                <Image
                  source={{ uri: brand.uri }}
                  style={[
                    logoSize(logoAspect),
                    brand.tint && { tintColor: colors.white },
                  ]}
                  resizeMode="contain"
                  onError={() => setLogoFailed(true)}
                  accessibilityLabel={platformName}
                />
              ) : (
                // Hold the mark's slot while it is measured, so nothing jumps.
                <View style={styles.logoPlaceholder} />
              )
            ) : (
              <Text style={styles.wordmark} numberOfLines={1}>
                {platformName}
              </Text>
            )}
          </View>

          {/* ── The task, anchored to the bottom ── */}
          <View>
            {showImageMark ? (
              <Text style={styles.eyebrow}>{platformName}</Text>
            ) : null}
            <Text style={styles.headline} accessibilityRole="header">
              Find your club
            </Text>
            <Text style={styles.instruction}>
              Enter its name to sign in or join.
            </Text>

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
                variant="ghost"
                onPress={handleContinue}
                loading={loading}
                disabled={loading}
              />
            </View>

            <Text style={styles.hint}>Ask your club for its exact name</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

/**
 * On the 8pt grid:
 *   eyebrow → headline       8
 *   headline → instruction   8
 *   instruction → field     24
 *   field → button          16  (Input leaves it below itself)
 *   button → help           16
 * The brand pins to the top and the task to the bottom (space-between), so the
 * photo shows through the middle on any screen height, and the form rises with
 * the keyboard.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Shows below the lifted photo, and for the instant before it paints.
    backgroundColor: DEEP_WATER,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  brand: {
    alignItems: 'center',
    minHeight: LOGO_MAX_HEIGHT,
    justifyContent: 'center',
  },
  logoPlaceholder: {
    height: LOGO_MAX_HEIGHT,
  },
  wordmark: {
    fontFamily: fontFamily.headingHeavy,
    fontSize: 22,
    letterSpacing: 4,
    color: colors.white,
  },
  eyebrow: {
    ...typography.bodyMedium,
    color: colors.white,
    opacity: 0.72,
    marginBottom: spacing.sm,
  },
  headline: {
    ...typography.display,
    color: colors.white,
    letterSpacing: -0.8,
  },
  instruction: {
    ...typography.body,
    color: colors.white,
    opacity: 0.72,
    marginTop: spacing.sm,
  },
  form: {
    marginTop: spacing.lg,
  },
  hint: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
