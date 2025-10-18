import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutTemplate, X, Search } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { PageTemplate } from '../../../types';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect: (templateId: string) => void;
}

export const TemplateSelector = ({ isOpen, onClose, onTemplateSelect }: TemplateSelectorProps) => {
  const { templates } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Все', count: templates.length },
    { id: 'personal', name: 'Личное', count: templates.filter(t => t.category === 'personal').length },
    { id: 'work', name: 'Работа', count: templates.filter(t => t.category === 'work').length },
    { id: 'project', name: 'Проекты', count: templates.filter(t => t.category === 'project').length },
    { id: 'education', name: 'Обучение', count: templates.filter(t => t.category === 'education').length },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTemplateSelect = (template: PageTemplate) => {
    onTemplateSelect(template.id);
    onClose();
    setSearchTerm('');
    setSelectedCategory('all');
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
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <LayoutTemplate className="w-6 h-6 text-gray-900" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Выберите шаблон</h2>
                  <p className="text-sm text-gray-500">Начните с готовой структуры</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Поиск и фильтры */}
            <div className="p-6 border-b border-gray-100">
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск шаблонов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      selectedCategory === category.id
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'bg-white text-gray-600'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Сетка шаблонов */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <LayoutTemplate className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Шаблоны не найдены</p>
                  <p className="text-sm mt-1">Попробуйте изменить поисковый запрос или категорию</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <motion.button
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTemplateSelect(template)}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:border-black hover:shadow-md transition-all group bg-white"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl flex-shrink-0">{template.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-black transition-colors truncate">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 capitalize">
                          {template.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {template.blocks.length} блоков
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};