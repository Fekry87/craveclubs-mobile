const fs = require('fs');
const path = require('path');

module.exports = ({ config }) => {
  const slug = process.env.EXPO_PUBLIC_CLUB_SLUG || 'craveclubs';
  const name = process.env.EXPO_PUBLIC_APP_NAME || process.env.EXPO_PUBLIC_CLUB_NAME || 'CraveClubs';
  const primaryColor =
    '#' + (process.env.EXPO_PUBLIC_PRIMARY_COLOR || '1A6FB5');

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
    ...config.expo,
    name,
    slug: 'craveclubs-' + slug,
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    newArchEnabled: true,

    icon: resolveIcon(iconPath, './assets/icon.png'),

    splash: {
      image: resolveIcon(splashPath, './assets/splash-icon.png'),
      resizeMode: 'contain',
      backgroundColor: primaryColor,
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier:
        config.expo?.ios?.bundleIdentifier || `com.craveclubs.${slug.replace(/-/g, '')}`,
    },

    android: {
      adaptiveIcon: {
        foregroundImage: resolveIcon(
          adaptiveIconPath,
          './assets/adaptive-icon.png'
        ),
        backgroundColor: primaryColor,
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package:
        config.expo?.android?.package || `com.craveclubs.${slug.replace(/-/g, '')}`,
    },

    web: {
      favicon: './assets/favicon.png',
    },

    plugins: [
      'expo-font',
      '@react-native-community/datetimepicker',
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
