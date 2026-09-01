import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ThemeTokens,
  THEME_CLASSIC,
  THEME_DARK,
  THEME_ROSE_DAWN,
  THEME_SAGE_BLOOM,
  THEME_GOLDEN_GLOW,
  THEME_PLUM_DUSK,
} from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { getCycleState } from '../domain/cycle/cycleEngine';
import { CyclePhase } from '../types';

export type ThemeMode = 'automatic' | 'classic' | 'dark';
export type MoodThemeKey = ThemeMode | 'system' | 'light' | 'rose' | 'sage' | 'gold' | 'lavender';

export interface ThemeColors extends ThemeTokens {
  // Legacy aliases for seamless backwards compatibility across existing components
  text: string;
  subtext: string;
}

export interface ThemeContextType {
  themeMode: ThemeMode;
  themeKey: MoodThemeKey; // legacy alias
  colors: ThemeColors;
  isDark: boolean;
  activePhase: CyclePhase;
  activeThemeName: string;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setThemeKey: (key: MoodThemeKey) => Promise<void>; // legacy compatibility
}

const THEME_MODE_STORAGE = 'ds_user_theme_mode_v4';

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'automatic',
  themeKey: 'automatic',
  colors: {
    ...THEME_CLASSIC,
    text: THEME_CLASSIC.textPrimary,
    subtext: THEME_CLASSIC.textSecondary,
  },
  isDark: false,
  activePhase: 'unknown',
  activeThemeName: THEME_CLASSIC.name,
  setThemeMode: async () => {},
  setThemeKey: async () => {},
});

export const ThemeCustomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('automatic');

  // Listen to store for cycle phase resolution
  const periods = useAppStore((state) => state.periods);
  const cyclePreferences = useAppStore((state) => state.cyclePreferences);

  useEffect(() => {
    async function loadSavedTheme() {
      try {
        const saved = await AsyncStorage.getItem(THEME_MODE_STORAGE);
        if (saved) {
          if (saved === 'classic' || saved === 'light') {
            setThemeModeState('classic');
          } else if (saved === 'dark') {
            setThemeModeState('dark');
          } else {
            setThemeModeState('automatic');
          }
        }
      } catch (e) {}
    }
    loadSavedTheme();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_MODE_STORAGE, mode);
    } catch (e) {
      console.warn('[ThemeContext] Error saving theme mode:', e);
    }
  };

  const setThemeKey = async (key: MoodThemeKey) => {
    if (key === 'dark') {
      await setThemeMode('dark');
    } else if (key === 'classic' || key === 'light') {
      await setThemeMode('classic');
    } else {
      await setThemeMode('automatic');
    }
  };

  // Calculate current cycle phase for automatic resolution
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const cycleState = useMemo(() => {
    return getCycleState(periods, cyclePreferences, todayStr);
  }, [periods, cyclePreferences, todayStr]);

  const activePhase = cycleState.phase;

  // Resolve Active Theme Tokens
  const activeTokens: ThemeTokens = useMemo(() => {
    if (themeMode === 'classic') {
      return THEME_CLASSIC;
    }
    if (themeMode === 'dark') {
      return THEME_DARK;
    }

    // Automatic (Cycle-Adaptive) Mode
    switch (activePhase) {
      case 'menstrual':
        return THEME_ROSE_DAWN;
      case 'follicular':
        return THEME_SAGE_BLOOM;
      case 'ovulatory':
        return THEME_GOLDEN_GLOW;
      case 'luteal':
        return THEME_PLUM_DUSK;
      default:
        return THEME_CLASSIC;
    }
  }, [themeMode, activePhase]);

  const colors: ThemeColors = useMemo(() => {
    return {
      ...activeTokens,
      text: activeTokens.textPrimary,
      subtext: activeTokens.textSecondary,
    };
  }, [activeTokens]);

  // Sync native Appearance (affects Alert modals and system UI)
  useEffect(() => {
    Appearance.setColorScheme(activeTokens.isDark ? 'dark' : 'light');
  }, [activeTokens.isDark]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        themeKey: themeMode,
        colors,
        isDark: colors.isDark,
        activePhase,
        activeThemeName: activeTokens.name,
        setThemeMode,
        setThemeKey,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);

// Export legacy helper mapping for UI cards where needed
export const MOOD_THEME_PALETTES = {
  automatic: { name: 'Automatic (Cycle-Adaptive)', icon: '✨' },
  classic: { name: 'Sini Classic', icon: '🌾' },
  dark: { name: 'Dark Mode', icon: '🌙' },
};

