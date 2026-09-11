import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { PlatformBranding } from '../../../api/services/platform.service';
import { colors, fontFamily } from '../../../theme';

const { width } = Dimensions.get('window');
const LOGO_SIZE = Math.min(width * 0.5, 240);

const DEFAULT_BG = '#6C4CF5';

/** Ensure a hex color string has a leading '#'. */
const toHex = (c?: string | null): string => {
  if (!c) return DEFAULT_BG;
  const v = c.trim();
  return v.startsWith('#') ? v : `#${v}`;
};

/**
 * App launch splash — a full-screen background color with a centered logo,
 * both controlled from the CraveClubs corporate settings (GET /public/branding).
 *
 * While the config is still loading (`config` is null) we show a neutral
 * screen instead of guessing a brand color — so the admin-set color never
 * gets replaced by a wrong default flash.
 */
export const SplashScreen: React.FC<{ config: PlatformBranding | null }> = ({
  config,
}) => {
  // Config not loaded yet → neutral hold (no brand color guess)
  if (!config) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.textDim} />
      </View>
    );
  }

  const bg = toHex(config.splash_background_color);
  const logo = config.splash_image_url || null;
  const fallback = (config.platform_name || 'CC').trim().slice(0, 2).toUpperCase();

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <View style={styles.center}>
        {logo ? (
          <Image source={{ uri: logo }} style={styles.logo} resizeMode="contain" />
        ) : (
          <Text style={styles.mark}>{fallback}</Text>
        )}
      </View>
      <ActivityIndicator color="rgba(255,255,255,0.9)" style={styles.spinner} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  mark: {
    fontSize: 56,
    letterSpacing: 2,
    color: '#FFFFFF',
    fontFamily: fontFamily.headingHeavy,
  },
  spinner: {
    position: 'absolute',
    bottom: 64,
  },
});
