import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTE } from '../constants/theme';

export type MoodThemeKey = 'system' | 'light' | 'dark' | 'rose' | 'sage' | 'gold' | 'lavender';

export interface ThemeColors {
  bg: string;
  card: string;
  text: string;
  subtext: string;
  accent: string;
  border: string;
  isDark: boolean;
}

export const MOOD_THEME_PALETTES: Record<MoodThemeKey, { name: string; icon: string; colors: (isSystemDark: boolean) => ThemeColors }> = {
  system: {
    name: 'System Default',
    icon: '📱',
    colors: (isSystemDark) => ({
      bg: isSystemDark ? PALETTE.darkBg : PALETTE.oat.bg,
      card: isSystemDark ? PALETTE.darkCard : PALETTE.white,
      text: isSystemDark ? PALETTE.darkText : PALETTE.charcoal.default,
      subtext: isSystemDark ? PALETTE.darkSubtext : PALETTE.charcoal.light,
      accent: PALETTE.plum.default,
      border: isSystemDark ? PALETTE.darkBorder : PALETTE.sand,
      isDark: isSystemDark,
    }),
  },
  light: {
    name: 'Sini Warm Oat',
    icon: '🌾',
    colors: () => ({
      bg: PALETTE.oat.bg,
      card: PALETTE.white,
      text: PALETTE.charcoal.default,
      subtext: PALETTE.charcoal.light,
      accent: PALETTE.plum.default,
      border: PALETTE.sand,
      isDark: false,
    }),
  },
  dark: {
    name: 'Sini Deep Plum Dark',
    icon: '🌙',
    colors: () => ({
      bg: PALETTE.darkBg,
      card: PALETTE.darkCard,
      text: PALETTE.darkText,
      subtext: PALETTE.darkSubtext,
      accent: PALETTE.plum.light,
      border: PALETTE.darkBorder,
      isDark: true,
    }),
  },
  rose: {
    name: 'Soft Rose Phase',
    icon: '🌸',
    colors: () => ({
      bg: PALETTE.rose.bg,
      card: PALETTE.white,
      text: '#4A2930',
      subtext: '#9E6C75',
      accent: PALETTE.rose.default,
      border: PALETTE.rose.light,
      isDark: false,
    }),
  },
  sage: {
    name: 'Sage Balance',
    icon: '🌿',
    colors: () => ({
      bg: PALETTE.sage.bg,
      card: PALETTE.white,
      text: '#22382C',
      subtext: '#5F7C6B',
      accent: PALETTE.sage.default,
      border: PALETTE.sage.light,
      isDark: false,
    }),
  },
  gold: {
    name: 'Warm Gold Ovulation',
    icon: '✨',
    colors: () => ({
      bg: PALETTE.gold.bg,
      card: PALETTE.white,
      text: '#3D311A',
      subtext: '#937331',
      accent: PALETTE.gold.default,
      border: PALETTE.gold.light,
      isDark: false,
    }),
  },
  lavender: {
    name: 'Lavender PMS Calm',
    icon: '💜',
    colors: () => ({
      bg: '#F8F5FF',
      card: PALETTE.white,
      text: '#2E243A',
      subtext: '#7A6B8F',
      accent: PALETTE.lavender,
      border: '#E2D9F3',
      isDark: false,
    }),
  },
};

interface ThemeContextType {
  themeKey: MoodThemeKey;
  colors: ThemeColors;
  isDark: boolean;
  setThemeKey: (key: MoodThemeKey) => Promise<void>;
}

const THEME_KEY_STORAGE = 'ds_user_mood_theme_v3';

const ThemeContext = createContext<ThemeContextType>({
  themeKey: 'system',
  colors: MOOD_THEME_PALETTES.system.colors(false),
  isDark: false,
  setThemeKey: async () => {},
});

export const ThemeCustomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useSystemColorScheme();
  const [themeKey, setThemeKeyState] = useState<MoodThemeKey>('system');

  useEffect(() => {
    async function loadSavedTheme() {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY_STORAGE);
        if (saved && MOOD_THEME_PALETTES[saved as MoodThemeKey]) {
          setThemeKeyState(saved as MoodThemeKey);
        }
      } catch (e) {}
    }
    loadSavedTheme();
  }, []);

  const setThemeKey = async (key: MoodThemeKey) => {
    try {
      setThemeKeyState(key);
      await AsyncStorage.setItem(THEME_KEY_STORAGE, key);
    } catch (e) {
      console.warn('[ThemeContext] Error saving theme key:', e);
    }
  };

  const isSystemDark = systemColorScheme === 'dark';
  const paletteGetter = MOOD_THEME_PALETTES[themeKey] || MOOD_THEME_PALETTES.system;
  const colors = paletteGetter.colors(isSystemDark);

  return (
    <ThemeContext.Provider value={{ themeKey, colors, isDark: colors.isDark, setThemeKey }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
