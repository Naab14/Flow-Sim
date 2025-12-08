import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Available themes
export type ThemeId = 'midnight' | 'light' | 'motherduck' | 'industrial' | 'nordic';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  icon: string; // emoji
  isDark: boolean;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep dark theme for focused work',
    icon: '🌙',
    isDark: true,
  },
  light: {
    id: 'light',
    name: 'Clean Light',
    description: 'Minimalist light theme',
    icon: '☀️',
    isDark: false,
  },
  motherduck: {
    id: 'motherduck',
    name: 'Professional',
    description: 'Clean, modern data platform style',
    icon: '🦆',
    isDark: false,
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial',
    description: 'Manufacturing floor inspired',
    icon: '🏭',
    isDark: true,
  },
  nordic: {
    id: 'nordic',
    name: 'Nordic',
    description: 'Scandinavian minimalism',
    icon: '❄️',
    isDark: false,
  },
};

interface ThemeContextType {
  theme: ThemeId;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeId) => void;
  isDark: boolean;
  availableThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('leanflow-theme') as ThemeId;
    return saved && THEMES[saved] ? saved : 'midnight';
  });

  const themeConfig = THEMES[theme];

  useEffect(() => {
    // Remove all theme classes
    Object.keys(THEMES).forEach(t => {
      document.documentElement.classList.remove(t);
    });
    document.documentElement.classList.remove('dark', 'light');

    // Apply new theme
    document.documentElement.classList.add(theme);
    document.documentElement.classList.add(themeConfig.isDark ? 'dark' : 'light');
    localStorage.setItem('leanflow-theme', theme);
  }, [theme, themeConfig.isDark]);

  const setTheme = (newTheme: ThemeId) => {
    if (THEMES[newTheme]) {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      themeConfig,
      setTheme,
      isDark: themeConfig.isDark,
      availableThemes: Object.values(THEMES)
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
