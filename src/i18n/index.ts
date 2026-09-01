import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, {
  LANGUAGE_STORAGE_KEY,
  LANGUAGE_NAMES,
  SUPPORTED_LOCALES,
  detectDeviceLanguage,
} from './config';

export { LANGUAGE_STORAGE_KEY, LANGUAGE_NAMES, SUPPORTED_LOCALES };

/**
 * Get current application language code
 */
export const getCurrentLanguage = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && SUPPORTED_LOCALES[saved as keyof typeof SUPPORTED_LOCALES]) {
      return saved;
    }
  } catch (e) {
    console.warn('Error reading stored language:', e);
  }
  return detectDeviceLanguage();
};

/**
 * Set and persist application display language
 */
export const setAppLanguage = async (lang: string): Promise<void> => {
  try {
    if (SUPPORTED_LOCALES[lang as keyof typeof SUPPORTED_LOCALES]) {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      await i18n.changeLanguage(lang);
    }
  } catch (e) {
    console.warn('Error setting application language:', e);
  }
};

/**
 * Initialize i18n language state on app launch
 */
export const initAppLanguage = async (): Promise<string> => {
  const lang = await getCurrentLanguage();
  if (i18n.language !== lang) {
    await i18n.changeLanguage(lang);
  }
  return lang;
};

/**
 * Translation helper wrapper around i18n.t
 */
export function t(key: string, options?: Record<string, any>): string {
  return i18n.t(key, options);
}

/**
 * Locale-aware number formatting wrapper using Intl.NumberFormat
 */
export function formatNumber(
  val: number,
  options?: Intl.NumberFormatOptions
): string {
  try {
    const locale = i18n.language || 'en';
    return new Intl.NumberFormat(locale, options).format(val);
  } catch (e) {
    return val.toString();
  }
}

/**
 * Locale-aware date formatting wrapper using Intl.DateTimeFormat
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const locale = i18n.language || 'en';
    const defaultOptions: Intl.DateTimeFormatOptions = options || {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
  } catch (e) {
    return typeof date === 'string' ? date : date.toLocaleDateString();
  }
}

/**
 * Locale-aware time formatting wrapper using Intl.DateTimeFormat
 */
export function formatTime(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const locale = i18n.language || 'en';
    const defaultOptions: Intl.DateTimeFormatOptions = options || {
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
  } catch (e) {
    return typeof date === 'string' ? date : date.toLocaleTimeString();
  }
}

export default i18n;
