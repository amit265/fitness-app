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
  todayTargets: string;
  askAuraCoach: string;
  calorieTarget: string;
  remainingCalories: string;
  consumedCalories: string;
  burnedCalories: string;
  menstrualPhase: string;
  follicularPhase: string;
  ovulatoryPhase: string;
  lutealPhase: string;
  howItWorks: string;
  reportOutput: string;
  aiDisclaimer: string;
}

const en: Translations = {
  appName: 'AuraFit',
  todayRhythm: "Today's Rhythm",
  readinessScore: 'Readiness Score',
  logMeal: 'Log Meal',
  logWorkout: 'Log Workout',
  logCycle: 'Log Period',
  settings: 'Settings',
  todayTargets: "Today's Targets",
  askAuraCoach: 'Ask Aura Coach...',
  calorieTarget: 'Calorie Target',
  remainingCalories: 'Remaining',
  consumedCalories: 'Consumed',
  burnedCalories: 'Burned',
  menstrualPhase: 'Menstrual Phase',
  follicularPhase: 'Follicular Phase',
  ovulatoryPhase: 'Ovulatory Phase',
  lutealPhase: 'Luteal Phase',
  howItWorks: 'How it works',
  reportOutput: 'Report Output',
  aiDisclaimer: '⚠️ AI responses are generated dynamically and may contain errors. Please verify critical facts.',
};

const es: Translations = {
  appName: 'AuraFit',
  todayRhythm: 'Ritmo de Hoy',
  readinessScore: 'Puntuación de Preparación',
  logMeal: 'Registrar Comida',
  logWorkout: 'Registrar Entrenamiento',
  logCycle: 'Registrar Período',
  settings: 'Configuración',
  todayTargets: 'Objetivos de Hoy',
  askAuraCoach: 'Preguntar a Coach Aura...',
  calorieTarget: 'Objetivo Calórico',
  remainingCalories: 'Restantes',
  consumedCalories: 'Consumidas',
  burnedCalories: 'Quemadas',
  menstrualPhase: 'Fase Menstrual',
  follicularPhase: 'Fase Folicular',
  ovulatoryPhase: 'Fase Ovulatoria',
  lutealPhase: 'Fase Lútea',
  howItWorks: 'Cómo funciona',
  reportOutput: 'Reportar Respuesta',
  aiDisclaimer: '⚠️ Las respuestas de la IA se generan dinámicamente y pueden contener errores. Verifique datos importantes.',
};

const id: Translations = {
  appName: 'AuraFit',
  todayRhythm: 'Ritme Hari Ini',
  readinessScore: 'Skor Kesiapan',
  logMeal: 'Catat Makanan',
  logWorkout: 'Catat Latihan',
  logCycle: 'Catat Haid',
  settings: 'Pengaturan',
  todayTargets: 'Target Hari Ini',
  askAuraCoach: 'Tanya Coach Aura...',
  calorieTarget: 'Target Kalori',
  remainingCalories: 'Sisa Kalori',
  consumedCalories: 'Dikonsumsi',
  burnedCalories: 'Dibatakar',
  menstrualPhase: 'Fase Haid',
  follicularPhase: 'Fase Folikular',
  ovulatoryPhase: 'Fase Ovulasi',
  lutealPhase: 'Fase Luteal',
  howItWorks: 'Cara kerja',
  reportOutput: 'Laporkan Respon',
  aiDisclaimer: '⚠️ Respon AI dihasilkan secara dinamis dan mungkin mengandung kesalahan. Harap verifikasi fakta penting.',
};

export const LOCALES: Record<string, Translations> = { en, es, id };

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Español (Spanish)',
  id: 'Bahasa Indonesia',
};

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

export const t = (key: keyof Translations, lang: string = 'en'): string => {
  const dict = LOCALES[lang] || LOCALES.en;
  return dict[key] || LOCALES.en[key] || key;
};
