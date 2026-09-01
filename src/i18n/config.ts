import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { en } from './locales/en';
import { id } from './locales/id';
import { hi } from './locales/hi';
import { es } from './locales/es';
import { ptBR } from './locales/pt-BR';
import { fr } from './locales/fr';
import { de } from './locales/de';

export const LANGUAGE_STORAGE_KEY = 'ds_user_language_pref';

export const SUPPORTED_LOCALES = {
  en,
  id,
  hi,
  es,
  'pt-BR': ptBR,
  fr,
  de,
};

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  id: 'Bahasa Indonesia',
  hi: 'हिन्दी',
  es: 'Español',
  'pt-BR': 'Português (Brasil)',
  fr: 'Français',
  de: 'Deutsch',
};

// Priority mapping for initial device locale detection
export const detectDeviceLanguage = (): string => {
  try {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      const tag = locales[0].languageTag; // e.g. "pt-BR", "en-US", "id-ID"
      const code = locales[0].languageCode; // e.g. "pt", "en", "id", "hi"

      if (tag && SUPPORTED_LOCALES[tag as keyof typeof SUPPORTED_LOCALES]) {
        return tag;
      }
      if (code && SUPPORTED_LOCALES[code as keyof typeof SUPPORTED_LOCALES]) {
        return code;
      }
      if (code === 'pt') return 'pt-BR';
    }
  } catch (e) {
    console.warn('Failed to detect device locale:', e);
  }
  return 'en';
};

const resources = {
  en: { translation: en },
  id: { translation: id },
  hi: { translation: hi },
  es: { translation: es },
  'pt-BR': { translation: ptBR },
  fr: { translation: fr },
  de: { translation: de },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  compatibilityJSON: 'v4',
});

export default i18n;
