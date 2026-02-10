import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Moon, Sun, Check } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useI18n } from '../../hooks/useI18n';

export const ThemeToggle = () => {
  const { currentTheme, themes, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();

  const isDark = currentTheme === 'dark' || currentTheme === 'blue-dark';

  const getThemeName = (themeId: string) => {
    const themeMap: Record<string, string> = {
      'light': t('theme.light'),
      'dark': t('theme.dark'),
      'blue-light': t('theme.blueLight'),
      'blue-dark': t('theme.blueDark'),
    };
    return themeMap[themeId] || themeId;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-fast text-text hover:bg-hover border border-border"
        aria-label={t('theme.changeTheme')}
      >
        {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <div
              className="absolute right-0 top-12 z-50 w-48 bg-background border border-border rounded-lg shadow-xl overflow-hidden"
            >
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-fast hover:bg-hover text-left text-text"
                >
                  <div 
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border 
                    }}
                  >
                    {currentTheme === theme.id && (
                      <Check className="w-3 h-3" style={{ color: theme.colors.text }} />
                    )}
                  </div>
                  <span className="font-medium">{getThemeName(theme.id)}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
