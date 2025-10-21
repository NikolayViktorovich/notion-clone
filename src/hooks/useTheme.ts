import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme, AppSettings } from '../types';

interface ThemeState {
  currentTheme: string;
  themes: Theme[];
  settings: AppSettings;
  setTheme: (themeId: string) => void;
  addCustomTheme: (theme: Omit<Theme, 'id'>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const defaultThemes: Theme[] = [
  {
    id: 'light',
    name: 'Светлая',
    type: 'light',
    colors: {
      primary: '#000000',
      background: '#ffffff',
      sidebar: '#f8f9fa',
      text: '#000000',
      textSecondary: '#666666',
      border: '#e5e5e5',
      hover: '#f5f5f5',
      accent: '#000000',
      button: '#000000',
      buttonText: '#ffffff',
    },
  },
  {
    id: 'dark',
    name: 'Тёмная',
    type: 'dark',
    colors: {
      primary: '#3c3b3b',
      background: '#1a1a1a',
      sidebar: '#2d2d2d',
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      border: '#404040',
      hover: '#363636',
      accent: '#000000',
      button: '#000000', 
      buttonText: '#ffffff',
    },
  },
  {
    id: 'blue-dark',
    name: 'Синяя тёмная',
    type: 'dark',
    colors: {
      primary: '#ffffff',
      background: '#0f172a',
      sidebar: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      hover: '#334155',
      accent: '#3b82f6',
      button: '#3b82f6',
      buttonText: '#ffffff',
    },
  },
  {
    id: 'warm-light',
    name: 'Тёплая светлая',
    type: 'light',
    colors: {
      primary: '#422006',
      background: '#fef7ed',
      sidebar: '#fffbeb',
      text: '#422006',
      textSecondary: '#854d0e',
      border: '#fdba74',
      hover: '#fed7aa',
      accent: '#ea580c',
      button: '#ea580c',
      buttonText: '#ffffff',
    },
  },
];

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: 'light',
      themes: defaultThemes,
      settings: {
        theme: 'light',
        language: 'ru',
        fontSize: 16,
        reducedMotion: false,
      },
      
      setTheme: (themeId) => {
        const theme = get().themes.find(t => t.id === themeId);
        if (theme) {
          set({ 
            currentTheme: themeId,
            settings: { ...get().settings, theme: themeId }
          });
          applyThemeToDocument(theme);
        }
      },
      
      addCustomTheme: (themeData) => {
        const newTheme: Theme = {
          ...themeData,
          id: `custom-${Date.now()}`,
        };
        
        set((state) => ({
          themes: [...state.themes, newTheme],
        }));
        
        get().setTheme(newTheme.id);
      },
      
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));

        if (newSettings.theme) {
          const theme = get().themes.find(t => t.id === newSettings.theme);
          if (theme) {
            applyThemeToDocument(theme);
          }
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement;
  
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-sidebar', theme.colors.sidebar);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--color-border', theme.colors.border);
  root.style.setProperty('--color-hover', theme.colors.hover);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-button', theme.colors.button);
  root.style.setProperty('--color-button-text', theme.colors.buttonText);
  root.setAttribute('data-theme', theme.type); 
  root.setAttribute('data-theme-id', theme.id);
}

export { applyThemeToDocument };