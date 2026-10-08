import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light';

export interface ColorToken {
  name: string;
  hex: string;
  label: string;
  usage: string;
}

export const COLOR_DESIGN_SYSTEM: ColorToken[] = [
  { name: 'cyan', hex: '#00E5FF', label: 'Cyan', usage: 'Primary Accents & Telemetry Glow' },
  { name: 'purple', hex: '#7B2EFF', label: 'Purple', usage: 'AI Studio Neural Processing & Modals' },
  { name: 'pink', hex: '#FF007A', label: 'Hot Pink', usage: 'Instagram & Creative Visuals' },
  { name: 'green', hex: '#00FF85', label: 'Neon Green', usage: 'Published Status & Verified Rules' },
  { name: 'blue', hex: '#1E40AF', label: 'Deep Blue', usage: 'LinkedIn & Structured Foundations' },
  { name: 'amber', hex: '#F59E0B', label: 'Cyber Amber', usage: 'In Review Queue & Warnings' },
  { name: 'red', hex: '#EF4444', label: 'Crimson Red', usage: 'YouTube & Gatekeeper Flagged Checks' },
  { name: 'steel', hex: '#374151', label: 'Dark Steel', usage: 'Telemetry Borders & Monospace Badges' },
];

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
  colors: typeof COLOR_DESIGN_SYSTEM;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleTheme: () => {},
  setMode: () => {},
  colors: COLOR_DESIGN_SYSTEM,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('aeobility_theme');
    return (saved as ThemeMode) || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('aeobility_theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setMode, colors: COLOR_DESIGN_SYSTEM }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
