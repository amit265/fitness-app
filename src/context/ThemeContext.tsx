import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextType {
  themePreference: ThemePreference;
  isDark: boolean;
  setThemePreference: (pref: ThemePreference) => Promise<void>;
}

const THEME_PREF_KEY = 'ds_user_theme_preference_v1';

const ThemeContext = createContext<ThemeContextType>({
  themePreference: 'system',
  isDark: false,
  setThemePreference: async () => {},
});

export const ThemeCustomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useSystemColorScheme();
  const [themePreference, setThemePrefState] = useState<ThemePreference>('system');

  useEffect(() => {
    async function loadThemePref() {
      try {
        const saved = await AsyncStorage.getItem(THEME_PREF_KEY);
        if (saved && (saved === 'system' || saved === 'light' || saved === 'dark')) {
          setThemePrefState(saved as ThemePreference);
        }
      } catch (e) {}
    }
    loadThemePref();
  }, []);

  const setThemePreference = async (pref: ThemePreference) => {
    try {
      setThemePrefState(pref);
      await AsyncStorage.setItem(THEME_PREF_KEY, pref);
    } catch (e) {
      console.warn('[ThemeContext] Error saving theme preference:', e);
    }
  };

  const isDark =
    themePreference === 'system'
      ? systemColorScheme === 'dark'
      : themePreference === 'dark';

  return (
    <ThemeContext.Provider value={{ themePreference, isDark, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
