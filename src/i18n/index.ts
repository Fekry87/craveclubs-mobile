import { I18nManager } from 'react-native';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enNav from './locales/en/nav.json';
import enProfile from './locales/en/profile.json';
import arCommon from './locales/ar/common.json';
import arNav from './locales/ar/nav.json';
import arProfile from './locales/ar/profile.json';

export type Language = 'en' | 'ar';

export const resources = {
  en: { common: enCommon, nav: enNav, profile: enProfile },
  ar: { common: arCommon, nav: arNav, profile: arProfile },
} as const;

export const NAMESPACES = ['common', 'nav', 'profile'] as const;

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
