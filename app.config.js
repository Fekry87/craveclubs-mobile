const fs = require('fs');
const path = require('path');

module.exports = ({ config }) => {
  const slug = process.env.EXPO_PUBLIC_CLUB_SLUG || 'craveclubs';
  const name = process.env.EXPO_PUBLIC_APP_NAME || process.env.EXPO_PUBLIC_CLUB_NAME || 'CraveClubs';
  const primaryColor =
    '#' + (process.env.EXPO_PUBLIC_PRIMARY_COLOR || '1A6FB5');

  // Bundle ID: set per club via env.APP_BUNDLE_ID in eas.json profiles
  // (eas.json build profiles cannot set bundleIdentifier/package directly —
  // only app config can). Fallback derives from the slug.
  const bundleId =
    process.env.APP_BUNDLE_ID || `com.craveclubs.${slug.replace(/-/g, '')}`;

  // Resolve per-club icon assets (fallback to default)
  const clubIconDir = path.join(__dirname, 'assets', 'icons', slug);
  const defaultIconDir = path.join(__dirname, 'assets', 'icons', 'craveclubs');
  const hasClubIcons = fs.existsSync(
    path.join(clubIconDir, 'icon.png')
  );

  const iconBase = hasClubIcons ? clubIconDir : defaultIconDir;
  const iconPath = path.join(iconBase, 'icon.png');
  const adaptiveIconPath = path.join(iconBase, 'adaptive-icon.png');
  const splashPath = path.join(iconBase, 'splash.png');

  // Use relative paths from project root
  const rel = (abs) => './' + path.relative(__dirname, abs);

  // Final fallback to root assets if icons dir doesn't exist yet
  const resolveIcon = (clubPath, fallback) =>
    fs.existsSync(clubPath) ? rel(clubPath) : fallback;

  return {
    // `config` arrives already flattened, so the old `...config.expo` spread was
    // always undefined and app.json never applied — it has been removed rather
    // than revived, since every key it held is set explicitly below.
    ...config,
    name,
    slug: 'craveclubs-' + slug,
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    // newArchEnabled is gone: the New Architecture is the only one left from
    // React Native 0.82 on, and the key is no longer part of the config schema.

    icon: resolveIcon(iconPath, './assets/icon.png'),

    splash: {
      image: resolveIcon(splashPath, './assets/splash-icon.png'),
      resizeMode: 'contain',
      backgroundColor: primaryColor,
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleId,
    },

    android: {
      adaptiveIcon: {
        foregroundImage: resolveIcon(
          adaptiveIconPath,
          './assets/adaptive-icon.png'
        ),
        backgroundColor: primaryColor,
      },
      // edgeToEdgeEnabled is gone: Android 16 makes edge-to-edge mandatory, so
      // the key is no longer a choice and newer SDKs warn on it.
      predictiveBackGestureEnabled: false,
      package: bundleId,
    },

    web: {
      favicon: './assets/favicon.png',
    },

    plugins: [
      'expo-font',
      'expo-localization',
      // @react-native-community/datetimepicker is deliberately not listed. Its
      // config plugin only writes Android picker theme colors when it is given
      // `android.datePicker` / `android.timePicker` options, and it was listed
      // bare — a no-op. From SDK 55 on it also fails to load at all, because
      // @expo/config-plugins moved inside the expo package and the plugin
      // requires it as an undeclared peer.
      'expo-secure-store',
      [
        '@sentry/react-native',
        {
          project: 'swimming-app',
          organization: 'craveclubs',
        },
      ],
    ],
  };
};
