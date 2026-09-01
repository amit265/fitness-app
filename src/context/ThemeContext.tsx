import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTE } from '../constants/theme';

export type MoodThemeKey = 'system' | 'light' | 'dark' | 'rose' | 'sage' | 'amber' | 'lavender';

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
      bg: isSystemDark ? '#121110' : PALETTE.oat.bg,
      card: isSystemDark ? '#1C1A18' : PALETTE.white,
      text: isSystemDark ? PALETTE.cream : PALETTE.charcoal.default,
      subtext: isSystemDark ? '#8D8070' : PALETTE.charcoal.light,
      accent: PALETTE.sage.default,
      border: isSystemDark ? '#2E2B28' : '#ECE9E4',
      isDark: isSystemDark,
    }),
  },
  light: {
    name: 'Clean Oat',
    icon: '☀️',
    colors: () => ({
      bg: PALETTE.oat.bg,
      card: PALETTE.white,
      text: PALETTE.charcoal.default,
      subtext: PALETTE.charcoal.light,
      accent: PALETTE.sage.default,
      border: '#ECE9E4',
      isDark: false,
    }),
  },
  dark: {
    name: 'Midnight Slate',
    icon: '🌙',
    colors: () => ({
      bg: '#121110',
      card: '#1C1A18',
      text: PALETTE.cream,
      subtext: '#8D8070',
      accent: PALETTE.sage.default,
      border: '#2E2B28',
      isDark: true,
    }),
  },
  rose: {
    name: 'Rose Quartz',
    icon: '🌸',
    colors: () => ({
      bg: '#FFF5F6',
      card: '#FFFFFF',
      text: '#4A282D',
      subtext: '#9E6B73',
      accent: '#E86375',
      border: '#FCDCE1',
      isDark: false,
    }),
  },
  sage: {
    name: 'Sage Balance',
    icon: '🌿',
    colors: () => ({
      bg: '#F3F7F4',
      card: '#FFFFFF',
      text: '#1E3326',
      subtext: '#5B7A67',
      accent: '#487A5B',
      border: '#D8E5DC',
      isDark: false,
    }),
  },
  amber: {
    name: 'Golden Glow',
    icon: '⚡',
    colors: () => ({
      bg: '#FFFBF2',
      card: '#FFFFFF',
      text: '#3D2D10',
      subtext: '#8A7038',
      accent: '#D97706',
      border: '#FDE68A',
      isDark: false,
    }),
  },
  lavender: {
    name: 'Lavender PMS Calm',
    icon: '💜',
    colors: () => ({
      bg: '#F8F5FF',
      card: '#FFFFFF',
      text: '#2D1B4E',
      subtext: '#7C67A3',
      accent: '#8B5CF6',
      border: '#DDD6FE',
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

const THEME_KEY_STORAGE = 'ds_user_mood_theme_v2';

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
