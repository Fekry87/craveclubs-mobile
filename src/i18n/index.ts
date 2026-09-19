import { I18nManager } from 'react-native';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enNav from './locales/en/nav.json';
import enProfile from './locales/en/profile.json';
import enSessions from './locales/en/sessions.json';
import enHome from './locales/en/home.json';
import enProgress from './locales/en/progress.json';
import enPlan from './locales/en/plan.json';
import enLeaderboard from './locales/en/leaderboard.json';
import enNotifications from './locales/en/notifications.json';
import arCommon from './locales/ar/common.json';
import arNav from './locales/ar/nav.json';
import arProfile from './locales/ar/profile.json';
import arSessions from './locales/ar/sessions.json';
import arHome from './locales/ar/home.json';
import arProgress from './locales/ar/progress.json';
import arPlan from './locales/ar/plan.json';
import arLeaderboard from './locales/ar/leaderboard.json';
import arNotifications from './locales/ar/notifications.json';

export type Language = 'en' | 'ar';

export const resources = {
  en: {
    common: enCommon,
    nav: enNav,
    profile: enProfile,
    sessions: enSessions,
    home: enHome,
    progress: enProgress,
    plan: enPlan,
    leaderboard: enLeaderboard,
    notifications: enNotifications,
  },
  ar: {
    common: arCommon,
    nav: arNav,
    profile: arProfile,
    sessions: arSessions,
    home: arHome,
    progress: arProgress,
    plan: arPlan,
    leaderboard: arLeaderboard,
    notifications: arNotifications,
  },
} as const;

export const NAMESPACES = [
  'common',
  'nav',
  'profile',
  'sessions',
  'home',
  'progress',
  'plan',
  'leaderboard',
  'notifications',
] as const;

/**
 * Arabic ⟺ RTL. `I18nManager.isRTL` is set natively when the user picks a
 * language and persists across restarts, so it is the synchronous source of
 * truth at launch — the font map in theme/typography keys off the same flag,
 * keeping text and direction in lock-step with no first-frame flash.
 */
export const languageFromLayout = (): Language =>
  I18nManager.isRTL ? 'ar' : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: languageFromLayout(),
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: NAMESPACES as unknown as string[],
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
