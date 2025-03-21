
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeMode, FontFamily } from '@/types';

interface ThemeContextProps {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  font: FontFamily;
  setFont: (font: FontFamily) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [font, setFontState] = useState<FontFamily>('inter');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    const savedFont = localStorage.getItem('font') as FontFamily | null;
    
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    }
    
    if (savedFont) {
      setFontState(savedFont);
    }
  }, []);

  // Apply theme and font when they change
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Apply theme
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
    
    // Apply font
    root.classList.remove('font-inter', 'font-roboto', 'font-playfair', 'font-montserrat', 'font-opensans');
    root.classList.add(`font-${font}`);
    
    // Save preferences to localStorage
    localStorage.setItem('theme', theme);
    localStorage.setItem('font', font);
  }, [theme, font]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const setFont = (newFont: FontFamily) => {
    setFontState(newFont);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, font, setFont }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
