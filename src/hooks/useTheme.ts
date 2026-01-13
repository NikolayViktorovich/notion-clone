import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeId = 'light' | 'dark' | 'blue-dark' | 'warm-light';

interface ThemeColors {
  primary: string;
  background: string;
  sidebar: string;
  text: string;
  textSecondary: string;
  border: string;
  hover: string;
  accent: string;
  button: string;
  buttonText: string;
}

interface Theme {
  id: ThemeId;
  name: string;
  colors: ThemeColors;
}

interface ThemeState {
  currentTheme: ThemeId;
  themes: Theme[];
  setTheme: (themeId: ThemeId) => void;
}

const themes: Theme[] = [
  {
    id: 'light',
    name: 'Светлая',
    colors: {
      primary: '#000000',
      background: '#ffffff',
      sidebar: '#fafafa',
      text: '#000000',
      textSecondary: '#666666',
      border: '#e0e0e0',
      hover: '#f5f5f5',
      accent: '#000000',
      button: '#000000',
      buttonText: '#ffffff',
    },
  },
  {
    id: 'dark',
    name: 'Тёмная',
    colors: {
      primary: '#ffffff',
      background: '#000000',
      sidebar: '#0a0a0a',
      text: '#ffffff',
      textSecondary: '#888888',
      border: '#222222',
      hover: '#111111',
      accent: '#ffffff',
      button: '#ffffff',
      buttonText: '#000000',
    },
  },
  {
    id: 'blue-dark',
    name: 'Синяя',
    colors: {
      primary: '#e2e8f0',
      background: '#0f172a',
      sidebar: '#1e293b',
      text: '#e2e8f0',
      textSecondary: '#64748b',
      border: '#334155',
      hover: '#1e293b',
      accent: '#3b82f6',
      button: '#3b82f6',
      buttonText: '#ffffff',
    },
  },
  {
    id: 'warm-light',
    name: 'Тёплая',
    colors: {
      primary: '#44403c',
      background: '#faf8f5',
      sidebar: '#f5f0e8',
      text: '#292524',
      textSecondary: '#78716c',
      border: '#e7e5e4',
      hover: '#f5f5f4',
      accent: '#d97706',
      button: '#d97706',
      buttonText: '#ffffff',
    },
  },
];

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      currentTheme: 'light',
      themes,
      setTheme: (themeId) => {
        const theme = themes.find(t => t.id === themeId);
        if (theme) {
          set({ currentTheme: themeId });
          applyTheme(theme);
        }
      },
    }),
    { name: 'theme-storage' }
  )
);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const { colors } = theme;
  
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-sidebar', colors.sidebar);
  root.style.setProperty('--color-text', colors.text);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-hover', colors.hover);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-button', colors.button);
  root.style.setProperty('--color-button-text', colors.buttonText);
  
  root.setAttribute('data-theme', theme.id);
}

export { applyTheme as applyThemeToDocument };
