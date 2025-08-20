'use client'

import { useEffect, useState, useCallback, ReactNode, useMemo } from 'react';
import { 
  ThemeConfig, 
  ThemeState, 
  ThemeContextValue, 
  ThemeColors, 
  HSLColor
} from '../types/theme';
import {
  applyThemeColors,
  applyDarkModeClass,
  getSystemDarkMode,
  onSystemDarkModeChange,
  getDefaultThemeColors,
  setPrimaryColor
} from '../lib/theme-utils';
import { ThemeContext } from '../contexts/theme-context';

export interface ThemeProviderProps {
  children: ReactNode;
  config?: ThemeConfig;
}

export function ThemeProvider({ children, config }: ThemeProviderProps) {
  // Use memo to avoid re-rendering the default colors on every render
  const defaultColors = useMemo(() => getDefaultThemeColors(), []);
  
  // Initialize theme state
  const [themeState, setThemeState] = useState<ThemeState>(() => {
    const initialDarkMode = config?.darkMode === 'auto' 
      ? getSystemDarkMode() 
      : config?.initialDarkMode ?? false;
      
    return {
      isDark: initialDarkMode,
      darkMode: config?.darkMode ?? 'auto',
      primaryColor: config?.primaryColor ?? null,
      lightColors: { ...defaultColors.light, ...config?.lightColors },
      darkColors: { ...defaultColors.dark, ...config?.darkColors },
      borderRadius: config?.borderRadius ?? 1,
      darkModeClass: config?.darkModeClass ?? 'lem-dark'
    };
  });

  // Apply theme changes to DOM
  const applyTheme = useCallback((state: ThemeState) => {
    const colors = state.isDark ? state.darkColors : state.lightColors;
    
    // Apply custom colors
    applyThemeColors(colors, state.isDark);
    
    // Apply primary color if specified
    if (state.primaryColor) {
      setPrimaryColor(state.primaryColor);
    }
    
    // Apply dark mode class
    applyDarkModeClass(state.isDark, state.darkModeClass);
    
    // Apply border radius
    document.documentElement.style.setProperty('--lem-radius', `${state.borderRadius}rem`);
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    applyTheme(themeState);
  }, [applyTheme, themeState]);

  // Handle system dark mode changes
  useEffect(() => {
    if (themeState.darkMode !== 'auto') return;
    
    const cleanup = onSystemDarkModeChange((isDark) => {
      setThemeState(prev => {
        const newState = { ...prev, isDark };
        applyTheme(newState);
        return newState;
      });
    });
    
    return cleanup;
  }, [themeState.darkMode, applyTheme]);

  // Theme control functions
  const toggleDarkMode = useCallback(() => {
    if (themeState.darkMode === 'disabled') return;
    
    setThemeState(prev => {
      const newState: ThemeState = { 
        ...prev, 
        isDark: !prev.isDark,
        darkMode: 'manual' as const // Switch to manual mode when user manually toggles
      };
      applyTheme(newState);
      return newState;
    });
  }, [themeState.darkMode, applyTheme]);

  const setDarkMode = useCallback((isDark: boolean) => {
    if (themeState.darkMode === 'disabled') {
      console.warn('Dark mode is disabled, calling setDarkMode will have no effect');
      return;
    }
    
    setThemeState(prev => {
      const newState: ThemeState = { 
        ...prev, 
        isDark,
        darkMode: 'manual' as const // Switch to manual mode when user manually sets
      };
      applyTheme(newState);
      return newState;
    });
  }, [themeState.darkMode, applyTheme]);

  const setPrimaryColorHandler = useCallback((color: string | HSLColor) => {
    setThemeState(prev => {
      const newState = { ...prev, primaryColor: color };
      applyTheme(newState);
      return newState;
    });
  }, [applyTheme]);

  const setLightColors = useCallback((colors: Partial<ThemeColors>) => {
    setThemeState(prev => {
      const newState = { 
        ...prev, 
        lightColors: { ...prev.lightColors, ...colors }
      };
      applyTheme(newState);
      return newState;
    });
  }, [applyTheme]);

  const setDarkColors = useCallback((colors: Partial<ThemeColors>) => {
    setThemeState(prev => {
      const newState = { 
        ...prev, 
        darkColors: { ...prev.darkColors, ...colors }
      };
      applyTheme(newState);
      return newState;
    });
  }, [applyTheme]);

  const resetTheme = useCallback(() => {
    const defaultColors = getDefaultThemeColors();
    const initialDarkMode = config?.darkMode === 'auto' 
      ? getSystemDarkMode() 
      : config?.initialDarkMode ?? false;
      
    const newState: ThemeState = {
      isDark: initialDarkMode,
      darkMode: config?.darkMode ?? 'auto',
      primaryColor: config?.primaryColor ?? null,
      lightColors: { ...defaultColors.light, ...config?.lightColors },
      darkColors: { ...defaultColors.dark, ...config?.darkColors },
      borderRadius: config?.borderRadius ?? 1,
      darkModeClass: config?.darkModeClass ?? 'lem-dark'
    };
    
    setThemeState(newState);
    applyTheme(newState);
  }, [config, applyTheme]);

  const contextValue: ThemeContextValue = {
    ...themeState,
    toggleDarkMode,
    setDarkMode,
    setPrimaryColor: setPrimaryColorHandler,
    setLightColors,
    setDarkColors,
    resetTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
