// src/components/theme/ThemeToggle.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Palette, Check } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle = () => {
  const { currentTheme, themes, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentThemeData = themes.find(t => t.id === currentTheme);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-hover rounded-lg transition-colors text-sm text-text hover:bg-border"
      >
        {currentThemeData?.type === 'dark' ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
        <Palette className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-12 z-50 w-64 bg-background border border-border rounded-lg shadow-xl p-2"
          >
            <div className="space-y-1">
              <h3 className="px-3 py-2 text-sm font-semibold text-text">Темы</h3>
              
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-hover text-left"
                >
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center"
                    style={{ 
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.primary 
                    }}
                  >
                    {currentTheme === theme.id && (
                      <Check className="w-3 h-3" style={{ color: theme.colors.primary }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-text">{theme.name}</div>
                    <div className="text-xs text-text-secondary capitalize">
                      {theme.type === 'light' ? 'Светлая' : 'Тёмная'}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-border mt-2 pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-3 py-2 text-sm text-text-secondary hover:bg-hover rounded-lg transition-colors"
              >
                Настройки тем...
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};