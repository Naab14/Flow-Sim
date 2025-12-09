import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Color schemes (each has dark and light variants)
export type ColorScheme = 'default' | 'motherduck' | 'industrial' | 'nordic';
export type Mode = 'dark' | 'light';

export interface ColorSchemeConfig {
  id: ColorScheme;
  name: string;
  description: string;
  icon: string;
}

export const COLOR_SCHEMES: Record<ColorScheme, ColorSchemeConfig> = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'Classic LeanFlow theme',
    icon: '🎨',
  },
  motherduck: {
    id: 'motherduck',
    name: 'Professional',
    description: 'Clean, modern data platform style',
    icon: '🦆',
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial',
    description: 'Manufacturing floor inspired',
    icon: '🏭',
  },
  nordic: {
    id: 'nordic',
    name: 'Nordic',
    description: 'Scandinavian minimalism',
    icon: '❄️',
  },
};

interface ThemeContextType {
  colorScheme: ColorScheme;
  mode: Mode;
  setColorScheme: (scheme: ColorScheme) => void;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  isDark: boolean;
  availableSchemes: ColorSchemeConfig[];
  // Legacy compatibility
  theme: ColorScheme;
  setTheme: (scheme: ColorScheme) => void;
  themeConfig: ColorSchemeConfig;
  availableThemes: ColorSchemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem('leanflow-color-scheme') as ColorScheme;
    return saved && COLOR_SCHEMES[saved] ? saved : 'default';
  });

  const [mode, setModeState] = useState<Mode>(() => {
    const saved = localStorage.getItem('leanflow-mode') as Mode;
    if (saved === 'dark' || saved === 'light') return saved;
    // Check system preference
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    // Remove all scheme classes
    Object.keys(COLOR_SCHEMES).forEach(scheme => {
      document.documentElement.classList.remove(scheme);
    });
    document.documentElement.classList.remove('dark', 'light');

    // Apply new scheme and mode
    document.documentElement.classList.add(colorScheme);
    document.documentElement.classList.add(mode);

    localStorage.setItem('leanflow-color-scheme', colorScheme);
    localStorage.setItem('leanflow-mode', mode);
  }, [colorScheme, mode]);

  const setColorScheme = (scheme: ColorScheme) => {
    if (COLOR_SCHEMES[scheme]) {
      setColorSchemeState(scheme);
    }
  };

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
  };

  const toggleMode = () => {
    setModeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{
      colorScheme,
      mode,
      setColorScheme,
      setMode,
      toggleMode,
      isDark: mode === 'dark',
      availableSchemes: Object.values(COLOR_SCHEMES),
      // Legacy compatibility
      theme: colorScheme,
      setTheme: setColorScheme,
      themeConfig: COLOR_SCHEMES[colorScheme],
      availableThemes: Object.values(COLOR_SCHEMES)
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
