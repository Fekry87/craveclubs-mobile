import { create } from 'zustand';
import { Alert, I18nManager } from 'react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import i18n, { Language, languageFromLayout } from '../i18n';
import { storageService } from '../services/storage.service';

const LANG_KEY = 'language';

interface LanguageState {
  language: Language;
  isRTL: boolean;
  isSwitching: boolean;
  /** Persist the choice, flip i18n + native RTL, then reload to apply. */
  setLanguage: (lang: Language) => Promise<void>;
  /** Sync store + i18n to the native layout direction on launch. */
  restore: () => Promise<void>;
}

const isExpoGo = Constants.appOwnership === 'expo';

/**
 * An RTL flip needs the native root view and module registry re-created, not
 * just a JS refresh — `DevSettings.reload()` only does the latter and leaves
 * the bridge half torn down (surfaces as "Cannot find native module …").
 * `Updates.reloadAsync()` performs a genuine native relaunch and is the only
 * safe programmatic path, but it isn't available in Expo Go. There, the user
 * closes and reopens the app themselves; the persisted native flag makes the
 * next cold start pick up the new direction correctly.
 */
async function reloadApp(): Promise<void> {
  if (!isExpoGo) {
    try {
      await Updates.reloadAsync();
      return;
    } catch {
      // Fall through to the manual-restart prompt below.
    }
  }
  Alert.alert(
    i18n.t('language.restartNeededTitle', { ns: 'common' }),
    i18n.t('language.restartNeededBody', { ns: 'common' }),
  );
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: languageFromLayout(),
  isRTL: I18nManager.isRTL,
  isSwitching: false,

  setLanguage: async (lang) => {
    if (lang === get().language || get().isSwitching) return;
    set({ isSwitching: true });
    try {
      await storageService.set(LANG_KEY, lang);
      await i18n.changeLanguage(lang);
    } catch {
      // Best effort — the layout flag + reload below still apply the choice.
    }
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(lang === 'ar');
    await reloadApp();
  },

  restore: async () => {
    // The native layout direction persists across launches and is the source
    // of truth; i18n already inits from it, so this just syncs store state.
    const lang = languageFromLayout();
    if (i18n.language !== lang) {
      try {
        await i18n.changeLanguage(lang);
      } catch {
        // keep whatever i18n already resolved
      }
    }
    set({ language: lang, isRTL: I18nManager.isRTL });
  },
}));
