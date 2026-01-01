import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  border: string;
  success: string;
  error: string;
  card: string;
}

export const lightColors: ThemeColors = {
  background: '#f0fdf4', // emerald-50
  surface: '#ffffff',
  text: '#1f2937', // gray-800
  textSecondary: '#6b7280', // gray-500
  primary: '#10b981', // emerald-500
  border: '#e5e5e5',
  success: '#10b981',
  error: '#ef4444',
  card: '#ffffff',
};

export const darkColors: ThemeColors = {
  background: '#111827', // gray-900
  surface: '#1f2937', // gray-800
  text: '#f9fafb', // gray-50
  textSecondary: '#9ca3af', // gray-400
  primary: '#34d399', // emerald-400
  border: '#374151', // gray-700
  success: '#34d399',
  error: '#f87171',
  card: '#1f2937',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('user_theme');
      if (savedTheme) {
        setThemeState(savedTheme as Theme);
      } else if (systemColorScheme) {
        setThemeState(systemColorScheme as Theme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
        setIsLoaded(true);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    AsyncStorage.setItem('user_theme', newTheme).catch((err) =>
      console.error('Error saving theme:', err)
    );
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  if (!isLoaded) {
      return null; 
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
