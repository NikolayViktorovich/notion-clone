import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, ArrowRight, X } from 'lucide-react';
import { useStore } from '../../../store/useStore';

interface SearchMatch {
  text: string;
  start: number;
  end: number;
}

export const EnhancedSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { searchContent, setCurrentPage } = useStore();
  
  const results = useMemo(() => {
    return searchContent(query);
  }, [query, searchContent]);

  const handleResultClick = (pageId: string) => {
    setCurrentPage(pageId);
    setIsOpen(false);
    setQuery('');
  };

  const highlightText = (text: string, matches: SearchMatch[]) => {
    if (!matches.length) return text;
    
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    
    matches.forEach((match, index) => {
      if (match.start > lastIndex) {
        elements.push(
          <span key={`before-${index}`}>
            {text.substring(lastIndex, match.start)}
          </span>
        );
      }
      
      elements.push(
        <mark key={`match-${index}`} className="bg-yellow-200 px-1 rounded">
          {text.substring(match.start, match.end)}
        </mark>
      );
      
      lastIndex = match.end;
    });
    
    if (lastIndex < text.length) {
      elements.push(
        <span key="after">
          {text.substring(lastIndex)}
        </span>
      );
    }
    
    return elements;
  };

  return (
    <>
      {/* Кнопка поиска */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-hover hover:bg-border rounded-lg transition-colors text-sm text-text"
      >
        <Search className="w-4 h-4" />
        <span>Поиск...</span>
        <kbd className="text-xs bg-background border border-border rounded px-1.5 py-0.5 text-text-secondary">Ctrl+K</kbd>
      </button>

      {/* Модальное окно поиска */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-background border border-border rounded-lg shadow-xl w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Поле поиска */}
              <div className="relative p-4 border-b border-border">
                <Search className="w-5 h-5 absolute left-6 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск по всем страницам и блокам..."
                  className="w-full pl-12 pr-10 py-3 border-0 focus:ring-0 text-lg placeholder-text-secondary bg-background text-text"
                  autoFocus
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 p-1 hover:bg-hover rounded"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              {/* Результаты */}
              <div className="max-h-96 overflow-y-auto">
                {query && results.length === 0 ? (
                  <div className="p-8 text-center text-text-secondary">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Ничего не найдено</p>
                    <p className="text-sm mt-1">Попробуйте изменить запрос</p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-medium text-text-secondary">
                      Найдено {results.length} результатов
                    </div>
                    {results.map((result, index) => (
                      <motion.div
                        key={`${result.pageId}-${result.blockId}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleResultClick(result.pageId)}
                        className="flex items-start gap-3 p-3 hover:bg-hover rounded-lg cursor-pointer transition-colors group"
                      >
                        <FileText className="w-5 h-5 text-text-secondary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text group-hover:text-accent transition-colors">
                            {result.pageTitle}
                          </p>
                          <p className="text-sm text-text mt-1">
                            {highlightText(result.content, result.matches)}
                          </p>
                          <p className="text-xs text-text-secondary mt-1 capitalize">
                            {result.blockType} блок
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-accent transition-colors flex-shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-text-secondary">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Начните вводить запрос для поиска</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};