import { Languages } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const updateTemplates = useStore(state => state.updateTemplates);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  const handleChange = (code: string) => {
    setLanguage(code as 'ru' | 'en');
    updateTemplates();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-hover transition-colors text-text border border-border"
        title="Change language"
      >
        <Languages className="w-4 h-4" />
        <span className="hidden sm:inline text-sm">{currentLang.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-48 bg-background border border-border rounded-lg shadow-xl overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleChange(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-hover transition-colors ${
                language === lang.code ? 'bg-hover' : ''
              }`}
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-text">{lang.name}</div>
                <div className="text-xs text-text-secondary">{lang.code.toUpperCase()}</div>
              </div>
              {language === lang.code && (
                <div className="w-2 h-2 rounded-full bg-accent"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
