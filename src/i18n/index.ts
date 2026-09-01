import AsyncStorage from '@react-native-async-storage/async-storage';

export const LANGUAGE_STORAGE_KEY = 'ds_user_language_pref';

export interface Translations {
  appName: string;
  todayRhythm: string;
  readinessScore: string;
  logMeal: string;
  logWorkout: string;
  logCycle: string;
  settings: string;
}

const en: Translations = {
  appName: 'AuraFit',
  todayRhythm: "Today's Rhythm",
  readinessScore: 'Readiness Score',
  logMeal: 'Log Meal',
  logWorkout: 'Log Workout',
  logCycle: 'Log Period',
  settings: 'Settings',
};

const es: Translations = {
  appName: 'AuraFit',
  todayRhythm: 'Ritmo de Hoy',
  readinessScore: 'Puntuación de Preparación',
  logMeal: 'Registrar Comida',
  logWorkout: 'Registrar Entrenamiento',
  logCycle: 'Registrar Período',
  settings: 'Configuración',
};

const id: Translations = {
  appName: 'AuraFit',
  todayRhythm: 'Ritme Hari Ini',
  readinessScore: 'Skor Kesiapan',
  logMeal: 'Catat Makanan',
  logWorkout: 'Catat Latihan',
  logCycle: 'Catat Haid',
  settings: 'Pengaturan',
};

export const LOCALES: Record<string, Translations> = { en, es, id };

export const getCurrentLanguage = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && LOCALES[saved]) return saved;
  } catch (e) {}
  return 'en';
};

export const setAppLanguage = async (lang: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (e) {}
};
