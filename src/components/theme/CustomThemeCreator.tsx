import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../types';

interface CustomThemeCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomThemeCreator = ({ isOpen, onClose }: CustomThemeCreatorProps) => {
  const { addCustomTheme } = useTheme();
  const [themeName, setThemeName] = useState('');
  const [themeType, setThemeType] = useState<'light' | 'dark'>('light');
  const [showPreview, setShowPreview] = useState(false);
  const initialColors = {
    light: {
      primary: '#000000',
      background: '#ffffff',
      sidebar: '#f8f9fa',
      text: '#000000',
      textSecondary: '#666666',
      border: '#e5e5e5',
      hover: '#f5f5f5',
      accent: '#000000',
    },
    dark: {
      primary: '#ffffff',
      background: '#1a1a1a',
      sidebar: '#2d2d2d',
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      border: '#404040',
      hover: '#363636',
      accent: '#ffffff',
    },
  };

  const [colors, setColors] = useState(initialColors.light);

  const handleColorChange = (colorKey: keyof typeof colors, value: string) => {
    setColors(prev => ({ ...prev, [colorKey]: value }));
  };

  const handleCreateTheme = () => {
    if (!themeName.trim()) return;

    addCustomTheme({
      name: themeName,
      type: themeType,
      colors: colors,
    });

    setThemeName('');
    setThemeType('light');
    setColors(initialColors.light);
    onClose();
  };

  const previewTheme: Theme = {
    id: 'preview',
    name: themeName || 'Предпросмотр',
    type: themeType,
    colors: colors,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Левая часть - настройки */}
            <div className="flex-1 p-6 border-r border-border overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text">Создать тему</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-hover rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-text" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Название темы */}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Название темы
                  </label>
                  <input
                    type="text"
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                    placeholder="Введите название темы..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>

                {/* Тип темы */}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Тип темы
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setThemeType('light');
                        setColors(initialColors.light);
                      }}
                      className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                        themeType === 'light'
                          ? 'bg-accent text-white border-accent'
                          : 'bg-background border-border text-text hover:bg-hover'
                      }`}
                    >
                      Светлая
                    </button>
                    <button
                      onClick={() => {
                        setThemeType('dark');
                        setColors(initialColors.dark);
                      }}
                      className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                        themeType === 'dark'
                          ? 'bg-accent text-white border-accent'
                          : 'bg-background border-border text-text hover:bg-hover'
                      }`}
                    >
                      Тёмная
                    </button>
                  </div>
                </div>

                {/* Настройки цветов */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-text">
                      Цвета
                    </label>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center gap-2 text-sm text-text-secondary hover:text-text"
                    >
                      {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showPreview ? 'Скрыть предпросмотр' : 'Показать предпросмотр'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(colors).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-xs text-text-secondary mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => handleColorChange(key as keyof typeof colors, e.target.value)}
                            className="w-10 h-10 rounded border border-border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleColorChange(key as keyof typeof colors, e.target.value)}
                            className="flex-1 px-2 py-1 bg-background border border-border rounded text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-border text-text rounded-lg hover:bg-hover transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleCreateTheme}
                  disabled={!themeName.trim()}
                  className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Создать тему
                </button>
              </div>
            </div>

            {/* Правая часть - предпросмотр */}
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 300, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="w-300 border-l border-border"
                >
                  <ThemePreview theme={previewTheme} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ThemePreview = ({ theme }: { theme: Theme }) => {
  return (
    <div 
      className="h-full p-4"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
      }}
    >
      <h3 className="font-semibold mb-4" style={{ color: theme.colors.text }}>
        {theme.name}
      </h3>
      
      <div className="space-y-3">
        {/* Предпросмотр сайдбара */}
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: theme.colors.sidebar }}
        >
          <div className="text-sm font-medium" style={{ color: theme.colors.text }}>
            Сайдбар
          </div>
          <div className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
            Элемент навигации
          </div>
        </div>

        {/* Предпросмотр контента */}
        <div className="space-y-2">
          <div className="h-4 rounded" style={{ backgroundColor: theme.colors.text }}></div>
          <div className="h-3 rounded w-3/4" style={{ backgroundColor: theme.colors.textSecondary }}></div>
          <div className="h-3 rounded w-1/2" style={{ backgroundColor: theme.colors.textSecondary }}></div>
        </div>

        {/* Предпросмотр кнопки */}
        <button
          className="w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: theme.colors.accent,
            color: theme.colors.background,
          }}
        >
          Кнопка
        </button>

        {/* Предпросмотр границы */}
        <div 
          className="p-3 rounded-lg border"
          style={{
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.hover,
          }}
        >
          <div className="text-xs" style={{ color: theme.colors.text }}>
            Карточка с границей
          </div>
        </div>
      </div>
    </div>
  );
};